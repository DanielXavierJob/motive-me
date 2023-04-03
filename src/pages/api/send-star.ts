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
    const doc = await getDoc(process.env.NEXT_PRIVATE_SHEET_ID ?? "");
    let sheet = doc.sheetsByIndex[0];

    try {
      let rows = await sheet.getRows();
      rows.map((row) => {
        if (row["Qual a frase?"] === JSON.parse(req.body).paragraph) {
          row.stars = Number(row.stars) + Number(JSON.parse(req.body).stars);
          row.quantity_stars = Number(row.quantity_stars) + 1;
          row.save().then(() => {
            console.log("Star atualizado!");
          });
        }
      });
      res.status(200).json({ message: "OK" });
    } catch (e) {
      res.status(500).json({ message: "Error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
