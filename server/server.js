const express = require("express");
const path = require("path");
const workouts = require("./workouts.json");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "..")));

app.get("/api/workouts", (req, res) => {
  const { week } = req.query;

  if (week) {
    if (week === "current") {
      const filtered = workouts.filter((item) =>
        isWithinCurrentWeek(item.date),
      );
      return res.status(200).json(filtered);
    }

    return res.status(404).json({ error: `Тренувань за період "${week}" не знайдено` });
  }

  res.status(200).json(workouts);
});

app.listen(PORT, () =>
  console.log(`Сервер успішно запущено на http://localhost:${PORT}`),
);

function isWithinCurrentWeek(dateString) {
  if (!dateString) {
    return false;
  }

  const workoutDate = new Date(dateString);
  workoutDate.setHours(0, 0, 0, 0);

  const now = new Date();
  const currentDay = now.getDay();
  const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysSinceMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
}
