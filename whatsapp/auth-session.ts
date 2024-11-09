import * as baileys from "@whiskeysockets/baileys";
import WhatsappAuthState from "../models/whatsapp/WhatsappAuthState.js";

async function read(sessionId: string, type: string) {
	try {
		const data = await WhatsappAuthState.findOne({
			type,
			sessionId,
		});

		if (!data) return null;

		return JSON.parse(data.data, baileys.BufferJSON.reviver);
	} catch (e: any) {
		console.log("Trying to read non existent session data");
		console.log(e.toString());
		return null;
	}
}

async function write(sessionId: string, data: any, type: string) {
	try {
		data = JSON.stringify(data, baileys.BufferJSON.replacer);

		await WhatsappAuthState.findOneAndUpdate(
			{ type, sessionId },
			{ type, sessionId, data },
			{ upsert: true, new: true }
		);
	} catch (e: any) {
		console.error(e.toString(), "An error occurred during session write");
	}
}

async function removeData(sessionId: string, type: string) {
	try {
		await WhatsappAuthState.deleteMany({ type, sessionId });
	} catch (error: any) {
		console.error(error.toString(), "An error occurred during session delete");
	}
}

export const initSession = async (sessionId: string) => {
	const creds: baileys.AuthenticationCreds =
		(await read(sessionId, "creds")) || baileys.initAuthCreds();

	return {
		state: {
			creds: creds,
			keys: {
				get: async (type: any, ids: any) => {
					// @ts-ignore
					const data: { [_: string]: SignalDataTypeMap[typeof type] } = {};
					await Promise.all(
						ids.map(async (id: string) => {
							let value = await read(sessionId, `authstore-${type}-${id}`);
							if (type === "app-state-sync-key" && value) {
								value =
									baileys.proto.Message.AppStateSyncKeyData.fromObject(value);
							}

							data[id] = value;
						})
					);

					return data;
				},
				set: async (data: any) => {
					const tasks: Promise<void>[] = [];
					for (const type in data) {
						for (const id in data[type]) {
							const value = data[type][id];
							const storeId = `authstore-${type}-${id}`;
							tasks.push(
								value
									? write(sessionId, value, storeId)
									: removeData(sessionId, storeId)
							);
						}
					}

					await Promise.all(tasks);
				},
			},
		},
		saveCreds: () => {
			return write(sessionId, creds, "creds");
		},
	};
};
