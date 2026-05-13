const AppDataSource = require("../config/db");

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, photoUrl } = req.body;
    const userRepo = AppDataSource.getRepository("User");
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (photoUrl !== undefined) user.photoUrl = photoUrl;
    await userRepo.save(user);
    res.json({
      message: "Profile updated",
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, photoUrl: user.photoUrl, role: user.role },
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getProfile = async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository("User");
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, photoUrl: user.photoUrl, role: user.role });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
