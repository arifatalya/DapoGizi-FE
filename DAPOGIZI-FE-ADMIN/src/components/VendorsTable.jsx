import {useState, useEffect} from 'react'
import axios from 'axios'
import fuzzysort from 'fuzzysort'
import '../styles/VendorsTable.css'
import Prev from '../assets/prev-page.svg'
import Next from '../assets/next-page.svg'
import Search from '../assets/search.svg'
import Close from '../assets/x.svg'

function VendorsTable({onOpenVendorModal}) {
    const server = `${import.meta.env.VITE_API_URL}`;
    const [vendors, setVendors] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState("latest");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(5);
    const start = (page - 1) * perPage;
    const end = start + perPage;

   useEffect(() =>  {
        const fetchVendors = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token")
                const response = await axios.get(`${server}/admin/view-vendors`, {
                    headers: {Authorization: `Bearer ${token}`}
                });

                const data = response.data.data || [];
                const sortedData = [...data].sort((a, b) => new Date(b.id.substring(0, 8*1000)) - new Date(a.id.substring(0, 8*1000)));
                setVendors(sortedData);
                setFiltered(sortedData);
            } catch (err) {
                console.error("Error retrieving all vendors:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchVendors();

    }, [server]);

   useEffect(() => {
       let temp = [...vendors];
       if (searchQuery.trim()) {
           const prepared = vendors.map((v) => ({vendor: v,
               target: `${v.vendor_name} ${v.email} ${v.address}`
           }));
           const results = fuzzysort.go(searchQuery, prepared, {
               key: "target",
               threshold: -10000
           });
           temp = results.map((r) => r.obj.vendor);
       }

       if (sortBy === "a-z") {
           temp.sort((a, b) => a.vendor_name.localeCompare(b.vendor_name));
       } else if (sortBy === "z-a") {
           temp.sort((a, b) => b.vendor_name.localeCompare(a.vendor_name));
       } else if (sortBy === "latest") {
           temp.sort((a, b) => {
               const tsA = parseInt(a.id.substring(0, 8), 16);
               const tsB = parseInt(b.id.substring(0, 8), 16);
               return tsB - tsA;
           });
       }
       setFiltered(temp);
       setPage(1);
   }, [searchQuery, sortBy, vendors]);

    const paged = filtered.slice(start, end);
    const totalPages = Math.ceil(filtered.length / perPage);

    useEffect(() => {
        setPage(1);
    }, [perPage]);

    const getVisiblePages = () => {
        const pages = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
            return pages;
        }
        if (page <= 3) {
            return [1, 2, 3, 4, "...", totalPages];
        }
        if (page >= totalPages - 2) {
            return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }
        return [1, "...", page - 1, page, page + 1, "...", totalPages];
    };

    const getAddressDisplay = (address) => {
        if (!address) {
            return
        }
        if (typeof address === "string") {
            return address;
        }
        return address.address_line_1 || address.full_address || "";
    };

    return (
        <div className="vendors-table-global-wrapper">
            <div className="vendors-table-actions">
                <div className="searchbar-wrapper">
                    <button className="search-button">
                        <img src={Search} alt="Search" />
                    </button>
                    <input
                        type="text"
                        value={searchQuery}
                        className="vendors-table-search"
                        placeholder="Search by name, email, or address"
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                    {searchQuery && (
                        <button className="search-clear-button" onClick={() => setSearchQuery("")}>
                            <img src={Close} alt="Clear" />
                        </button>
                    )}
                </div>
                <select className="vendors-table-filter" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                    <option value="latest">Latest</option>
                    <option value="a-z">A-Z</option>
                    <option value="z-a">Z-A</option>
                </select>
            </div>
            <div className="vendors-table-wrapper">
                {loading ? (
                    <div className="vendors-table-skeleton">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="vendors-table-skeleton-row"></div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="vendors-empty"><p>No vendors found.</p></div>
                ) : (
                    <table className="vendors-table">
                        <thead>
                        <tr>
                            <th>No.</th>
                            <th>Province</th>
                            <th>Vendor Name</th>
                            <th>Email</th>
                            <th>Address</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paged.map((vendor, index) => (
                            <tr key={vendor.id} className="clickable-vendor-row" onClick={() => onOpenVendorModal(vendor)}>
                                <td>{start + index + 1}</td>
                                <td>
                                    <span className={"province-badge " + (vendor.address?.province ? "province-" + vendor.address.province.replace(/\s+/g, "").toLowerCase() : "province-unknown")}>
                                        {vendor.address?.province || "Unknown"}
                                    </span>
                                </td>
                                <td>{vendor.vendor_name}</td>
                                <td>{vendor.email}</td>
                                <td>{getAddressDisplay(vendor.address)}</td>
                                <td>
                                    <button className="view-vendor-button" onClick={(event) => {event.stopPropagation();onOpenVendorModal(vendor);}}>
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
                <div className="vt-pagination-wrapper">
                    <div className="vt-pagination">
                        {page > 1 && (
                            <button className="vt-prev-button" onClick={() => setPage(page - 1)}>
                                <img src={Prev} alt="Prev" />
                            </button>
                        )}
                        {getVisiblePages().map((pages, index) =>
                            pages === "..." ? (
                                <span key={index} className="vt-ellipsis">…</span>
                            ) : (
                                <button key={index} onClick={() => setPage(pages)} className={`vt-page-number ${pages === page ? "active" : ""}`}>
                                    {pages}
                                </button>
                            )
                        )}
                        {page < totalPages && (
                            <button className="vt-next-button" onClick={() => setPage(page + 1)}>
                                <img src={Next} alt="Next" />
                            </button>
                        )}
                    </div>
                    <div className="vt-per-page">
                        <span>Show per page:</span>
                        <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VendorsTable;