const FOOD_CATEGORIES = {
    makanan_pokok: [
        'nasi', 'nasi putih', 'nasi merah', 'nasi goreng', 'nasi kuning', 'nasi uduk', 'rice',
        'roti', 'roti tawar', 'roti gandum', 'roti bakar', 'bread',
        'mie', 'mie goreng', 'mie kuah', 'mie ayam', 'bakmi', 'pasta', 'spaghetti', 'noodle',
        'kentang', 'kentang goreng', 'kentang rebus', 'french fries', 'potato',
        'singkong', 'ubi', 'ubi jalar', 'talas', 'cassava',
        'jagung', 'corn', 'oatmeal', 'sereal', 'cereal'
    ],

    lauk_pauk: [
        'ayam', 'ayam goreng', 'ayam bakar', 'ayam rica', 'ayam penyet', 'ayam geprek',
        'chicken', 'fried chicken',
        'ikan', 'ikan goreng', 'ikan bakar', 'salmon', 'tuna', 'fish',
        'udang', 'cumi', 'kerang', 'shrimp', 'squid',
        'telur', 'telur dadar', 'telur rebus', 'telur mata sapi', 'telur ceplok',
        'omelette', 'egg',
        'daging', 'daging sapi', 'sapi', 'rendang', 'steak', 'beef',
        'kambing', 'domba', 'lamb', 'mutton',
        'tahu', 'tahu goreng', 'tahu bakar', 'tofu',
        'tempe', 'tempe goreng', 'tempe bacem', 'tempeh',
        'sosis', 'nugget', 'bakso', 'sausage', 'meatball'
    ],

    sayur: [
        'bayam', 'kangkung', 'sawi', 'selada', 'lettuce', 'spinach',
        'wortel', 'tomat', 'timun', 'terong', 'carrot', 'tomato', 'cucumber', 'eggplant',
        'brokoli', 'kembang kol', 'kol', 'kubis', 'broccoli', 'cauliflower', 'cabbage',
        'buncis', 'kacang panjang', 'green beans',
        'paprika', 'cabai', 'pepper', 'chili',
        'labu', 'zucchini', 'pumpkin',
        'sayur asem', 'sayur lodeh', 'capcay', 'gado-gado', 'pecel', 'urap',
        'cap cay', 'tumis', 'oseng', 'vegetable'
    ],

    buah: [
        'pisang', 'banana',
        'apel', 'apple',
        'jeruk', 'orange',
        'mangga', 'mango',
        'pepaya', 'papaya',
        'melon', 'semangka', 'watermelon',
        'anggur', 'grape',
        'strawberry', 'stroberi',
        'kiwi', 'nanas', 'pineapple',
        'pir', 'pear',
        'buah naga', 'dragon fruit',
        'jambu', 'guava',
        'durian', 'rambutan', 'manggis',
        'fruit', 'salad buah'
    ],

    susu: [
        'susu', 'milk',
        'keju', 'cheese',
        'yogurt', 'yoghurt',
        'es krim', 'ice cream',
        'pudding', 'custard'
    ]
};


function classifyFood(foodName) {
    if (!foodName) return null;

    const normalizedFood = foodName.toLowerCase().trim();

    for (const [category, foods] of Object.entries(FOOD_CATEGORIES)) {
        for (const food of foods) {
            if (normalizedFood === food) {
                return category;
            }
        }
    }

    for (const [category, foods] of Object.entries(FOOD_CATEGORIES)) {
        for (const food of foods) {
            const regex = new RegExp(`\\b${food}\\b`, 'i');
            if (regex.test(normalizedFood)) {
                return category;
            }
        }
    }

    for (const [category, foods] of Object.entries(FOOD_CATEGORIES)) {
        for (const food of foods) {
            if (food.includes(normalizedFood) && normalizedFood.length >= 3) {
                return category;
            }
        }
    }

    return null;
}

function analyze4Sehat5Sempurna(predictions, confidences = []) {
    const categorized = {
        makanan_pokok: [],
        lauk_pauk: [],
        sayur: [],
        buah: [],
        susu: []
    };

    const detectedFoods = [];
    const unrecognizedFoods = [];

    predictions.forEach((foodName, index) => {
        const category = classifyFood(foodName);
        const confidence = confidences[index] || null;

        if (category) {
            if (!categorized[category].includes(foodName.toLowerCase())) {
                categorized[category].push(foodName.toLowerCase());
            }

            detectedFoods.push({
                name: foodName,
                category,
                confidence
            });
        } else {
            unrecognizedFoods.push(foodName);
        }
    });

    const fulfilledCategories = Object.keys(categorized).filter(
        cat => categorized[cat].length > 0
    );

    const totalCategories = fulfilledCategories.length;

    const status = getCompletionStatus(categorized);

    const allCategories = ['makanan_pokok', 'lauk_pauk', 'sayur', 'buah', 'susu'];
    const categoriesMissing = allCategories.filter(cat => categorized[cat].length === 0);

    return {
        status,
        categories_fulfilled: categorized,
        categories_missing: categoriesMissing,
        total_categories: totalCategories,
        detected_foods: detectedFoods,
        unrecognized_foods: unrecognizedFoods,
        analysis_date: new Date()
    };
}

function getCompletionStatus(categories) {
    const hasPokok = categories.makanan_pokok.length > 0;
    const hasLauk = categories.lauk_pauk.length > 0;
    const hasSayur = categories.sayur.length > 0;
    const hasBuah = categories.buah.length > 0;
    const hasSusu = categories.susu.length > 0;

    if (hasPokok && hasLauk && hasSayur && hasBuah && hasSusu) {
        return '5 Sempurna';
    }

    if (hasPokok && hasLauk && hasSayur && hasBuah) {
        return '4 Sehat';
    }

    return 'Tidak Memenuhi';
}


function getCategoryDisplayName(categoryKey) {
    const displayNames = {
        makanan_pokok: 'Makanan Pokok',
        lauk_pauk: 'Lauk Pauk',
        sayur: 'Sayur-sayuran',
        buah: 'Buah-buahan',
        susu: 'Susu'
    };

    return displayNames[categoryKey] || categoryKey;
}

module.exports = {
    classifyFood,
    analyze4Sehat5Sempurna,
    getCompletionStatus,
    getCategoryDisplayName,
    FOOD_CATEGORIES
};