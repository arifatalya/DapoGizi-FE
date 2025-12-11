function determineKitchenStatus(prediction) {
    if (!prediction || typeof prediction !== "string") {
        return "unknown";
    }

    const normalized = prediction.trim().toLowerCase();

    if (normalized === "clean") {
        return "clean";
    }
    if (normalized === "dirty") {
        return "dirty";
    }

    return "unknown";
}

module.exports = { determineKitchenStatus };
