import {useState, useEffect} from 'react'
import axios from 'axios'
import '../styles/ProvinceChart.css'

function ProvinceChart() {
    const server = `${import.meta.env.VITE_API_URL}`;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const PROVINCE_COLORS = {
        "Aceh": "#ef4444",
        "Sumatera Utara": "#f97316",
        "Sumatera Barat": "#f59e0b",
        "Riau": "#eab308",
        "Jambi": "#84cc16",
        "Sumatera Selatan": "#22c55e",
        "Bengkulu": "#10b981",
        "Lampung": "#14b8a6",
        "Bangka Belitung": "#06b6d4",
        "Kepulauan Riau": "#0ea5e9",
        "DKI Jakarta": "#3b82f6",
        "Jawa Barat": "#6366f1",
        "Jawa Tengah": "#8b5cf6",
        "Daerah Istimewa Yogyakarta": "#a855f7",
        "Jawa Timur": "#d946ef",
        "Banten": "#ec4899",
        "Bali": "#f43f5e",
        "Nusa Tenggara Barat": "#fb7185",
        "Nusa Tenggara Timur": "#fda4af",
        "Kalimantan Barat": "#a3e635",
        "Kalimantan Tengah": "#4ade80",
        "Kalimantan Selatan": "#34d399",
        "Kalimantan Timur": "#2dd4bf",
        "Kalimantan Utara": "#22d3ee",
        "Sulawesi Utara": "#38bdf8",
        "Sulawesi Tengah": "#60a5fa",
        "Sulawesi Selatan": "#818cf8",
        "Sulawesi Tenggara": "#a78bfa",
        "Gorontalo": "#c084fc",
        "Sulawesi Barat": "#e879f9",
        "Maluku": "#f472b6",
        "Maluku Utara": "#fb923c",
        "Papua": "#facc15",
        "Papua Barat": "#a3a3a3",
        "Unknown": "#6b7280",
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${server}/admin/view-vendors`, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                const vendors = response.data.data || [];
                const counts = {};

                vendors.forEach((vendor) => {
                    const province = vendor.address?.province || "Unknown";
                    counts[province] = (counts[province] || 0) + 1;
                });

                const total = vendors.length;
                const chartData = Object.entries(counts)
                    .map(([name, count]) => ({
                        name,
                        count,
                        percentage: ((count / total) * 100).toFixed(1),
                        color: PROVINCE_COLORS[name] || "#6b7280",
                    }))
                    .sort((a, b) => b.count - a.count);

                setData(chartData);
            } catch (err) {
                console.error("Error fetching province data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [server]);

    const total = data.reduce((sum, d) => sum + d.count, 0);

    const calculateSegments = () => {
        let currentAngle = 0;
        return data.map((item, index) => {
            const angle = (item.count / total) * 360;
            const segment = {
                ...item,
                startAngle: currentAngle,
                endAngle: currentAngle + angle,
                index,
            };
            currentAngle += angle;
            return segment;
        });
    };

    const segments = calculateSegments();

    const polarToCartesian = (angle, radius = 50) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        return {
            x: 60 + radius * Math.cos(rad),
            y: 60 + radius * Math.sin(rad),
        };
    };

    const createArcPath = (startAngle, endAngle, radius = 50) => {
        if (endAngle - startAngle >= 360) {
            return `M 60 10 A 50 50 0 1 1 59.99 10 Z`;
        }
        const start = polarToCartesian(startAngle, radius);
        const end = polarToCartesian(endAngle, radius);
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
        return `M 60 60 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
    };

    if (loading) {
        return (
            <div className="province-chart-container">
                <h3 className="province-chart-title">Vendor Distribution</h3>
                <div className="province-chart-skeleton"></div>
            </div>
        );
    }

    return (
        <div className="province-chart-container">
            <h3 className="province-chart-title">Vendor Distribution by Province</h3>
            <div className="province-chart-content">
                <div className="province-pie-wrapper">
                    <svg viewBox="0 0 120 120" className="province-pie">
                        {segments.map((seg, i) => (
                            <path
                                key={seg.name}
                                d={createArcPath(seg.startAngle, seg.endAngle - 0.5)}
                                fill={seg.color}
                                className={`pie-segment ${hoveredIndex === i ? 'hovered' : ''}`}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />
                        ))}
                        <circle cx="60" cy="60" r="28" fill="white" />
                        <text x="60" y="56" textAnchor="middle" className="pie-center-number">
                            {total}
                        </text>
                        <text x="60" y="70" textAnchor="middle" className="pie-center-label">
                            vendors
                        </text>
                    </svg>
                </div>
                <div className="province-legend">
                    {data.slice(0, 6).map((item, i) => (
                        <div
                            key={item.name}
                            className={`legend-item ${hoveredIndex === i ? 'hovered' : ''}`}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                            <span className="legend-name">{item.name}</span>
                            <span className="legend-count">{item.count}</span>
                        </div>
                    ))}
                    {data.length > 6 && (
                        <div className="legend-more">
                            +{data.length - 6} more provinces
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProvinceChart;