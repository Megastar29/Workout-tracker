console.log("script.js підключено");

const workouts = [
    { type: "Командний спорт", minutes: 40, calories: 600 },
    { type: "Кардіо", minutes: 5, calories: 100 },
    { type: "Силове", minutes: 30, calories: 800 },
];

// Функція підрахунку усіх витрачених калорій впродовж тренувань
function sumCalories(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i].calories;
    }

    return sum;
}

// Функція, яка класифікує тренування за тривалістю
function classifyTrainings(arr) {
    const shortTrainingMax = 30;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i].minutes <= shortTrainingMax) {
            console.log(arr[i].type + ": " + "Коротке");
        } else {
            console.log(arr[i].type + ": " + "Довге");
        }
    }
}

// Функція розрахунку кількості спалених калорій за хвилину тренування
const caloriesPerMinute = (w) => Math.round(w.calories / w.minutes);

console.log("Сума спалених калорій: " + sumCalories(workouts));
classifyTrainings(workouts);

for (const workout of workouts) {
    console.log(
        "Тренування: " +
            workout.type +
            " -> " +
            caloriesPerMinute(workout) +
            " кал/хв",
    );
}
