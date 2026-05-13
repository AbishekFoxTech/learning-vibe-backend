const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AppDataSource = require("../config/db");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRepo = AppDataSource.getRepository("User");

    const user = await userRepo.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await userRepo.save(user);

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Refresh Token Required" });

    const userRepo = AppDataSource.getRepository("User");
    const user = await userRepo.findOne({ where: { refreshToken } });

    if (!user) return res.status(403).json({ message: "Invalid Refresh Token" });

    // Verify token
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Token Expired or Invalid" });

      const newToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token: newToken });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};