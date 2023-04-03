// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string | Array<string>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    const getDoc = async (id: string) => {
      const doc = new GoogleSpreadsheet(id);
      await doc.useServiceAccountAuth({
        client_email: process.env.NEXT_PRIVATE_CLIENT_EMAIL ?? "",
        private_key: process.env.NEXT_PRIVATE_KEY
          ? process.env.NEXT_PRIVATE_KEY.replace(/\\n/g, "\n")
          : "",
      });
      await doc.loadInfo();
      return doc;
    };
    const blacklistDoc = await getDoc(
      process.env.NEXT_PRIVATE_SHEET_ID_BLACKLIST ?? ""
    );
    let sheet = blacklistDoc.sheetsByIndex[0];

    try {
      await sheet.addRow({
        blacklist: JSON.parse(req.body).paragraph,
      });
      res.status(200).json({ message: "OK" });
    } catch (e) {
      res.status(500).json({ message: "Error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
