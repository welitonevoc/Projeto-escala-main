import { gapi } from 'gapi-script';

const SPREADSHEET_ID = '1n3APlCM3A09w_RtjudFwiykmDNDrSiAQsrbMgaYKY6w';

const API_KEY = process.env.VITE_GOOGLE_API_KEY || '';

export const initClient = () => {
  return new Promise((resolve, reject) => {
    if (!API_KEY) {
      console.warn('VITE_GOOGLE_API_KEY not set. Google Sheets client-side API will not work.');
      resolve(false);
      return;
    }
    gapi.load('client', () => {
      gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
      }).then(() => {
        resolve(true);
      }).catch((err: any) => {
        reject(err);
      });
    });
  });
};

export const getSheetData = async (range: string) => {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
    });
    return response.result.values;
  } catch (error) {
    console.error('Erro ao buscar dados do Sheets:', error);
    throw error;
  }
};

export const updateSheetData = async (range: string, values: any[][]) => {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'RAW',
      resource: { values },
    });
    return response.result;
  } catch (error) {
    console.error('Erro ao atualizar dados no Sheets:', error);
    throw error;
  }
};
