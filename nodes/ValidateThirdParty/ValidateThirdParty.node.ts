import { validate3rd } from '@telegram-apps/init-data-node';
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class ValidateThirdParty implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Validate 3rd Init Data',
		name: 'validateThirdParty',
		group: ['transform'],
		version: 1,
		description: 'A node to validate third party init data from Telegram',
		defaults: {
			name: 'ValidateThirdParty',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Init Data',
				name: 'initData',
				type: 'string',
				default: '',
				placeholder:
					'user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%20%2B%20-%20%3F%20%5C%2F%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%22%7D&chat_instance=8134722200314281151&chat_type=private&auth_date=1733584787&signature=zL-ucjNyREiHDE8aihFwpfR9aggP2xiAo3NSpfe-p7IbCisNlDKlo7Kb6G4D0Ao2mBrSgEk4maLSdv6MLIlADQ&hash=2174df5b000556d044f3f020384e879c8efcab55ddea2ced4eb752e93e7080d6',
				description: 'String from window.Telegram.WebApp.initData to validate',
			},
			{
				displayName: 'Bot ID',
				name: 'botId',
				type: 'number',
				default: '',
				placeholder: '1234567890',
				description: 'Numeric ID of Telegram Bot to validate',
			},
			{
				displayName: 'Is Test Environment',
				name: 'isTestEnvironment',
				type: 'boolean',
				default: false,
				description: 'Whether the init data was received in the test Telegram environment or not',
			},
		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		let initData: string;
		let botId: number;
		let isTestEnvironment: boolean;

		const returnData: INodeExecutionData[] = [];

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				initData = this.getNodeParameter('initData', itemIndex, '') as string;
				botId = this.getNodeParameter('botId', itemIndex, '') as number;
				isTestEnvironment = this.getNodeParameter('isTestEnvironment', itemIndex, '') as boolean;

				item = items[itemIndex];

				await validate3rd(initData, botId, { test: isTestEnvironment });

				item.json.isValid = true;

				returnData.push({
					json: {
						isValid: true,
					},
				});
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							isValid: false,
							error: error.message
						},
					});
				} else {
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [items];
	}
}
