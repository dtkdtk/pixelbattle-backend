import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Long } from "mongodb";
import { UserRole, type MongoUser, type UserAuthKey } from "@models";
import { AuthLoginError, NotVerifiedEmailError } from "@core/errors/api";
import { generator, getIpAddress, logger, snowflake } from "@utils";
import { idCookieParameters, tokenCookieParameters } from "../constants";
import { config } from "@core/config";

export abstract class BaseOAuthHandler<
    T extends { id: string; email?: string }
> {
    protected request!: FastifyRequest;
    protected server!: FastifyInstance;

    abstract providerName: UserAuthKey;
    abstract authHelper: new () => {
        userId: string;
        getUserInfo(token: any): Promise<T>;
        postLoginAction?(token: any): Promise<void>;
    };

    abstract getOAuthToken: (request: FastifyRequest) => Promise<any>;
    abstract extractUserData: (userInfo: T) => {
        id: string;
        email?: string;
        username: string;
        verified?: boolean;
    };

    handle = async (request: FastifyRequest, response: FastifyReply) => {
        this.request = request;
        this.server = request.server;

        const token = await this.getOAuthToken(request).catch(() => {
            throw new AuthLoginError();
        });
        if (!token) throw new AuthLoginError();

        const helper = new this.authHelper();
        const userInfo = await helper.getUserInfo(token).catch(() => {
            throw new AuthLoginError();
        });

        this.checkEmailVerification(userInfo);

        const { id, email, username } = this.extractUserData(userInfo);

        const user = await this.findUser(id, email);
        const { token: authToken, _id } = this.prepareUserData(user);

        await this.updateUser(_id, user, {
            id,
            email: email!,
            username,
            authToken
        });

        logger.loginComplete({
            _id: _id.toString(),
            nickname: username,
            method: this.providerName,
            ip: getIpAddress(request)
        });

        if (helper.postLoginAction) {
            await helper.postLoginAction(token);
        }

        return response
            .cookie("token", authToken, tokenCookieParameters)
            .cookie("userid", _id.toString(), idCookieParameters)
            .redirect(config.frontend);
    };

    private async findUser(id: string, email: string | undefined) {
        return this.server.repository.users.findOne(
            {
                $or: [
                    { [`connections.${this.providerName}.id`]: id },
                    { email }
                ]
            },
            { _id: 0 }
        );
    }

    private prepareUserData(user: MongoUser | null) {
        return {
            token: user?.token || generator.generateToken(),
            _id: user?._id || BigInt(snowflake.generate())
        };
    }

    private async updateUser(
        _id: bigint,
        existingUser: MongoUser | null,
        data: { id: string; email: string; username: string; authToken: string }
    ) {
        const updateData = {
            token: data.authToken,
            email: existingUser?.email ?? data.email,
            username: existingUser?.username ?? data.username,
            tag: existingUser?.tag ?? null,
            badges: existingUser?.badges ?? 0,
            points: existingUser?.karma ?? 0,
            role: existingUser?.role ?? UserRole.User,
            connections: this.getConnectionsUpdate(existingUser, {
                id: data.id,
                username: data.username
            })
        };

        await this.server.repository.users.updateOne(
            { _id },
            { $set: updateData },
            { upsert: true }
        );
    }

    protected getUpdateData(
        existingUser: MongoUser | null,
        data: { id: string; email: string; username: string; authToken: string }
    ) {
        return {
            token: data.authToken,
            email: existingUser?.email ?? data.email,
            username: existingUser?.username ?? data.username,
            tag: existingUser?.tag ?? null,
            badges: existingUser?.badges ?? 0,
            points: existingUser?.karma ?? 0,
            role: existingUser?.role ?? UserRole.User,
            connections: {
                ...this.getConnectionsUpdate(existingUser, data)
            }
        };
    }

    protected getConnectionsUpdate(
        existingUser: MongoUser | null,
        data: { id: string; username: string }
    ) {
        const connections =
            existingUser?.connections || ({} as Record<UserAuthKey, any>);

        return {
            ...connections,
            [this.providerName]: {
                visible: connections[this.providerName]?.visible ?? true,
                username: data.username,
                id: data.id
            }
        };
    }

    protected checkEmailVerification = (userInfo: T): void => {
        const email = this.extractUserData(userInfo).email;
        if (!email) {
            throw new NotVerifiedEmailError();
        }
    };
}
