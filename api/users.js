export default function handler(req, res) {
const users = ["Ana", "Bruno", "Carlos", "Duda"];
res.status(200).json(users);
}
