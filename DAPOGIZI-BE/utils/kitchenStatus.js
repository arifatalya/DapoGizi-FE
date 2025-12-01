function determineKitchenStatus(prediction) {
    if (!prediction) return "unknown";
    return prediction.toLowerCase().includes("clean") ? "clean" : "dirty";
}

module.exports = { determineKitchenStatus };