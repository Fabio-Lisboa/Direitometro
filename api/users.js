import db from "./_db.js";


export default function handler(req, res) {
res.status(200).json(Object.keys(db.users));
}
