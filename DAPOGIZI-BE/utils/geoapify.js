const API_KEY = process.env.GEOAPIFY_API_KEY;

async function geocodeAddress(address) {
    if (!address) return null;
    const url = new URL("https://api.geoapify.com/v1/geocode/search");
    url.searchParams.set("text", address);
    url.searchParams.set("limit", "1");
    url.searchParams.set("lang", "id");
    url.searchParams.set("filter", "countrycode:id");
    url.searchParams.set("apiKey", API_KEY);

    const res = await fetch(url.href);
    if (!res.ok) return null;
    const data = await res.json();
    const feat = data?.features?.[0];
    if (!feat) return null;

    const lon = feat.geometry.coordinates[0];
    const lat = feat.geometry.coordinates[1];
    return { lon, lat, formatted: feat.properties.formatted };
}

function toRad(x) { return (x * Math.PI) / 180; }
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = toRad(lat1), φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
    const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function fetchPlaces({ categories, bias, limit, radius }) {
    const url = new URL("https://api.geoapify.com/v2/places");
    url.searchParams.set("categories", categories);
    url.searchParams.set("limit", String(limit || 3));
    url.searchParams.set("lang", "id");
    url.searchParams.set("apiKey", API_KEY);
    url.searchParams.set("filter", "countrycode:id");

    if (bias?.lon != null && bias?.lat != null && radius) {
        url.searchParams.set("filter", `circle:${bias.lon},${bias.lat},${radius}`);
        url.searchParams.set("bias", `proximity:${bias.lon},${bias.lat}`);
    } else if (bias?.lon != null && bias?.lat != null) {
        url.searchParams.set("bias", `proximity:${bias.lon},${bias.lat}`);
    }

    const res = await fetch(url.href);
    if (!res.ok) {
        console.error("[Geoapify] places error:", res.status, res.statusText);
        return [];
    }
    const data = await res.json();
    const feats = data?.features || [];
    return feats.map((feat) => {
        const props = feat.properties || {};
        const lon = feat.geometry.coordinates[0];
        const lat = feat.geometry.coordinates[1];
        return {
            name: props.name || "Unnamed School",
            address: props.formatted || "",
            location: { type: "Point", coordinates: [lon, lat] },
            geoapify_id: props.place_id || props.datasource?.raw?.place_id || "",
        };
    });
}

async function findNearbySchools(bias, limit = 3) {
    if (!bias || bias.lon == null || bias.lat == null) return [];

    const baseRadius = Number(process.env.GEOAPIFY_RADIUS_METERS || 3000);
    const steps = [
        { categories: "education.school", radius: baseRadius },
        { categories: "education.school", radius: baseRadius * 2 },
        { categories: "education",       radius: baseRadius },
        { categories: "education",       radius: baseRadius * 2 },
    ];

    let collected = [];
    for (const step of steps) {
        const list = await fetchPlaces({
            categories: step.categories,
            bias,
            limit: Math.max(limit, 6),
            radius: step.radius,
        });
        collected = collected.concat(list);
        if (collected.length >= limit) break;
    }

    const seen = new Set();
    const deduped = [];
    for (const item of collected) {
        const key = item.geoapify_id || `${item.name}|${item.location.coordinates.join(",")}`;
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(item);
    }

    if (deduped.length > 1) {
        const { lat: blat, lon: blon } = bias;
        deduped.sort((a, b) => {
            const [alon, alat] = a.location.coordinates;
            const [blon2, blat2] = b.location.coordinates;
            const da = haversine(blat, blon, alat, alon);
            const db = haversine(blat, blon, blat2, blon2);
            return da - db;
        });
    }

    return deduped.slice(0, limit);
}

module.exports = { geocodeAddress, findNearbySchools };