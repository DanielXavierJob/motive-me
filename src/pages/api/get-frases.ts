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
  const blacklistDoc = await getDoc(
    process.env.NEXT_PRIVATE_SHEET_ID_BLACKLIST ?? ""
  );
  let sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  let blacklist = blacklistDoc.sheetsByIndex[0];
  const rowsBlackList = await blacklist.getRows();
  let frases = [];
  if (rows.length > 0) {
    rows.map((row) => {
      const frase = row;
      if (
        !rowsBlackList.find((bl) =>
          bl["blacklist"].includes(frase["Qual a frase?"])
        )
      ) {
        if (row.stars === undefined) {
          row.stars = 0;
          row.quantity_stars = 0;
          row.save().then((data) => {
            if (row.ativo === "1") {
              frases.push({
                frase: row["Qual a frase?"],
                stars: Number(row.stars) / Number(row.quantity_stars),
                author: row["Qual o autor?"],
              });
            } else if (row.ativo === undefined) {
              row.ativo = "1";
              row.save().then(() => {
                frases.push({
                  frase: row["Qual a frase?"],
                  stars: Number(row.stars) / Number(row.quantity_stars),
                  author: row["Qual o autor?"],
                });
              });
            }
          });
        } else {
          if (row.ativo === "1") {
            frases.push({
              frase: row["Qual a frase?"],
              stars: Number(row.stars) / Number(row.quantity_stars),
              author: row["Qual o autor?"],
            });
          } else if (row.ativo === undefined) {
            row.ativo = "1";
            row.save().then(() => {
              frases.push({
                frase: row["Qual a frase?"],
                stars: Number(row.stars) / Number(row.quantity_stars),
                author: row["Qual o autor?"],
              });
            });
          }
        }
      } else {
        row.ativo = 0;
        row.save();
      }
    });
    if (frases.length === 0) {
      frases.push(
        "Oh, não possuímos nenhuma frase no momento, que tal você contribuir com uma frase motivacional?"
      );
    }
    res.status(200).json({ message: frases });
  }
}
