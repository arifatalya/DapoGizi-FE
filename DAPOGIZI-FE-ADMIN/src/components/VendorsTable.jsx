import {useState, useEffect} from 'react'
import axios from 'axios'
import fuzzysort from 'fuzzysort'
import '../styles/VendorsTable.css'
import Prev from '../assets/chevron-left.svg'
import Next from '../assets/chevron-right.svg'
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
    const PER_PAGE = 6;
    const start = (page -1) * PER_PAGE;
    const end = start + PER_PAGE;

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
               threshold: 0
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
    const totalPages = Math.ceil(filtered.length / PER_PAGE);

    return (
        <div className="vendors-table-global-wrapper">
            <div className="vendors-table-header">
                <h2>Current Registered Vendors</h2>
            </div>
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
                        onChange={event => setSearchQuery(event.target.value)}
                    />
                    {searchQuery.length > 0 && (
                        <button className="search-clear-button" onClick={(() => setSearchQuery(""))}>
                            <img src={Close} alt="Clear" title="Clear search input"/>
                        </button>
                    )}
                </div>
                <select className="vendors-table-filter" value={sortBy} onChange={((event) => setSortBy(event.target.value))}>
                    <option value="latest">Latest</option>
                    <option value="a-z">A-Z</option>
                    <option value="z-a">Z-A</option>
                </select>
            </div>
            <div className="vendors-table-wrapper">
                {loading ? (
                    <div className="vendors-table-skeleton">
                        {Array.from({length: 6}).map((_, index) => (
                            <div className="vendors-table-skeleton-row" key={index}></div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="vendors-empty">
                        <p>No vendors registered within the system.</p>
                    </div>
                ) : (
                    <table className="vendors-table">
                        <thead>
                        <tr>
                            <th>Vendor Name</th>
                            <th>Email</th>
                            <th>Address</th>
                            <th className="vendors-table-actions-column">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paged.map((vendor) => (
                            <tr key={vendor.id} className="clickable-vendor-row" onClick={() => onOpenVendorModal(vendor)}>
                                <td>{vendor.vendor_name}</td>
                                <td>{vendor.email}</td>
                                <td>{vendor.address}</td>
                                <td>
                                    <button className="view-vendor-button" onClick={((event) => {event.stopPropagation(); onOpenVendorModal(vendor.id);})}>
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="vendors-table-pagination">
                <button className="previous-button" title="Go to previous page" disabled={page === 1} onClick={(() => setPage((page) => page-1))}>
                    <img src={Prev} alt="Previous Page" />
                </button>
                <span className="page-number">{page} of {totalPages}</span>
                <button className="next-button" title="Go to next page" disabled={page === totalPages} onClick={(() => setPage((page) => page+1))}>
                    <img src={Next} alt="Next Page" />
                </button>
            </div>
        </div>
    );
}

export default VendorsTable;