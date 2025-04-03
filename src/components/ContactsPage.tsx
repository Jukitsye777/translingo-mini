import React, { useState, useEffect } from "react";
import Chatbox from "./Chatbox";
import { SparklesCore } from "./ui/Sparkles";
import { TextGenerateEffect } from "./ui/text-generate-effect"; 
import { motion } from "framer-motion";
import { supabase } from "../components/Supabaseclient.tsx";

const Logo = () => {
    const [hovered, setHovered] = useState(false);

    return (
        <motion.h1
            className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent transition-all duration-500 ease-in-out"
            style={{
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "2px",
                marginBottom: "15px",
                backgroundSize: "200% auto",
                backgroundPosition: hovered ? "right center" : "left center",
                textShadow: hovered ? "0px 0px 10px rgba(255,255,255,0.8)" : "none",
                transform: hovered ? "scale(1.1)" : "scale(1)",
            }}
            whileHover={{
                y: -3,
                textShadow: "0px 0px 8px rgba(255,255,255,0.8)",
                scale: 1.1,
            }}
            transition={{ type: "spring", stiffness: 300 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            TRANSLINGO
        </motion.h1>

        
    );
};

type Contact = {
    id: number;
    name: string;
    email: string;
};

type SupabaseUser = {
    firstname: string;
    lastname: string;
    email: string;
};

type Message = {
    id: number;
    sender_email: string;
    receiver_email: string;
    message: string;
    created_at: string;
    translated_text?: string;
    source_language?: string;
    target_language?: string;
};

const ContactsPage = () => {
    const [contacts, setContacts] = useState<Contact[]>([
        { id: 1, name: "Alice", email: "alice@example.com" },
        { id: 2, name: "Bob", email: "bob@example.com" },
    ]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [selectedToDelete, setSelectedToDelete] = useState<Set<number>>(new Set());
    const [showDelete, setShowDelete] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSettings, setShowSettings] = useState(false);
    const [username, setUsername] = useState(localStorage.getItem("username") || "");
    const [defaultLanguage, setDefaultLanguage] = useState(localStorage.getItem("defaultLanguage") || "English");
    const [userFirstName, setUserFirstName] = useState("");
    const [userProfilePic, setUserProfilePic] = useState("");
    const [searchUserEmail, setSearchUserEmail] = useState("");
    const [searchError, setSearchError] = useState("");
    const [showAddUserModal, setShowAddUserModal] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const userEmail = localStorage.getItem("userEmail");
            if (!userEmail) return;

            try {
                const { data, error } = await supabase
                    .from("auth-domain")
                    .select("firstname, lastname")
                    .eq("email", userEmail)
                    .single();

                if (error) throw error;

                if (data) {
                    setUserFirstName(data.firstname || "Guest");
                    // Update localStorage
                    localStorage.setItem("userFirstName", data.firstname || "");
                    localStorage.setItem("userLastName", data.lastname || "");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                // Fallback to localStorage values
                setUserFirstName(localStorage.getItem("userFirstName") || "Guest");
            }
        };

        fetchUserData();
    }, []);

    const handleSearchAndAddUser = async () => {
        try {
            setSearchError("");
            
            // Check if user already exists in contacts
            const existingContact = contacts.find(contact => contact.email === searchUserEmail);
            if (existingContact) {
                setSearchError("This user is already in your contacts!");
                return;
            }

            // Search user in Supabase
            const { data, error } = await supabase
                .from("auth-domain")
                .select("firstname, lastname, email")
                .eq("email", searchUserEmail)
                .single();

            if (error) {
                setSearchError("User not found!");
                return;
            }

            if (data) {
                // Add user to contacts
                const newContact: Contact = {
                    id: Date.now(),
                    name: `${data.firstname} ${data.lastname}`,
                    email: data.email
                };
                setContacts([...contacts, newContact]);
                setShowAddUserModal(false);
                setSearchUserEmail("");
            }
        } catch (error) {
            console.error("Error searching user:", error);
            setSearchError("An error occurred while searching for the user");
        }
    };

    const handleAddContact = () => {
        setShowAddUserModal(true);
        setSearchError("");
        setSearchUserEmail("");
    };

    const handleDeleteSelected = () => {
        setContacts(contacts.filter((contact) => !selectedToDelete.has(contact.id)));
        setSelectedToDelete(new Set());
        setShowDelete(false);
    };

    const toggleSelectContact = (id: number) => {
        setSelectedToDelete((prev) => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ display: "flex", width: "100vw", height: "100vh", background: "linear-gradient(to right, #BFD7ED, #60A3D9)", fontFamily: "'Poppins', sans-serif" }}>
            
            {/* Sidebar */}
            <div style={{ width: "320px", background: "linear-gradient(to bottom, #6A95CC , #A1CAFF)", padding: "20px", height: "100vh", color: "#fff", display: "flex", flexDirection: "column", 
        maxHeight: "100vh" }}>
                 <Logo />
                 <div style={{
    display: "flex",
    alignItems: "center",
    padding: "10px",
    marginBottom: "15px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
}}>
    <img 
        src={userProfilePic || "/default-avatar.png"} 
        alt="Profile" 
        style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            marginRight: "10px",
            objectFit: "cover",
            border: "2px solid white"
        }}
        onError={(e) => {
            e.currentTarget.src = "/default-avatar.png";
        }}
    />
    <span style={{
        color: "#fff",
        fontSize: "14px",
        fontWeight: "500"
    }}>
        {userFirstName || "Guest"}
    </span>
</div>
                 {showSettings && (
    <div
        style={{
            position: "absolute", // Change to absolute
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            zIndex: 1000, // Add z-index to ensure it's on top
            width: "300px", // Set a fixed width for consistent appearance

        }}
    >
        {/* Heading Added Here */}
        <h2 style={{ textAlign: "center", marginBottom: "10px", color: "#333" }}>
            User Settings
        </h2>
                        <h3 style={{ marginBottom: "10px" }}>Settings</h3>

                        {/* Username Input */}
                        <label style={{ display: "block", marginBottom: "5px", color: "#333" }}>Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ display: "block", marginBottom: "10px", padding: "8px", width: "calc(100% - 16px)" }}
                        />

                        {/* Default Language Selection */}
                        <label style={{ display: "block", marginBottom: "5px", color: "#333" }}>Default Language:</label>
                        <select
                            value={defaultLanguage}
                            onChange={(e) => setDefaultLanguage(e.target.value)}
                            style={{ display: "block", marginBottom: "10px", padding: "8px", width: "100%" }}
                        >
                            <option value="English">English</option>
                            <option value="French">French</option>
                            <option value="Spanish">Spanish</option>
                            <option value="German">German</option>
                            <option value="Chinese">Chinese</option>
                            <option value="Arabic">Arabic</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Italian">Italian</option>
                            <option value="Portuguese">Portuguese</option>
                            <option value="Russian">Russian</option>
                            <option value="Japanese">Japanese</option>
                            <option value="Korean">Korean</option>
                            <option value="Malayalam">Malayalam</option>
                        </select>

                        {/* Save & Close Buttons */}
                        <button
                            onClick={() => {
                                localStorage.setItem("username", username);
                                localStorage.setItem("defaultLanguage", defaultLanguage);
                                setShowSettings(false);
                            }}
                            style={{ padding: "8px 12px", backgroundColor: "#6A95CC", color: "#fff", borderRadius: "6px", cursor: "pointer", border: "none", marginRight: "10px" }}
                        >
                            Save
                        </button>

                        <button
                            onClick={() => setShowSettings(false)}
                            style={{ padding: "8px 12px", backgroundColor: "red", color: "#fff", borderRadius: "6px", cursor: "pointer", border: "none" }}
                        >
                            Close
                        </button>
                    </div>
                )}
                {/* Buttons Row */}
                <div style={{ display: "flex", justifyContent: "space-between",marginBottom: "10px" }}>
                <button 
    onClick={handleAddContact} 
    style={{ ...buttonStyle }} 
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2a3b5c"}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1a2b4c"}
>
    ➕ New Chat
</button>

<button 
    onClick={() => setShowDelete(!showDelete)} 
    style={{ ...buttonStyle }} 
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2a3b5c"}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1a2b4c"}
>
    {showDelete ? "❌ Cancel" : "🗑 Delete"}
</button>

<button 
    onClick={() => setShowSettings((prev) => !prev)} 
    style={{ ...buttonStyle }} 
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2a3b5c"}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1a2b4c"}
>
    ⚙️ Settings
</button>

                </div>

                {/* Search Bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search contacts..."
                        style={searchBarStyle}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} style={clearButtonStyle}>✖</button>
                    )}
                </div>

                {/* Contact List */}
               {/* Contact List (Now Scrollable) */}
<div style={{ flex: 1, overflowY: "auto", maxHeight: "60vh", paddingRight: "10px" }}>
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
                <li key={contact.id}
                    style={contactStyle}
                    onClick={() => setSelectedContact(contact)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1a2b4c"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#000b1f"}
                >
                    {showDelete && (
                        <input
                            type="checkbox"
                            style={{ marginRight: "10px", cursor: "pointer" }}
                            onChange={() => toggleSelectContact(contact.id)}
                            checked={selectedToDelete.has(contact.id)}
                        />
                    )}
                    {contact.name}
                </li>
            ))
        ) : (
            <p style={{ textAlign: "center", color: "#fff", fontSize: "14px", marginTop: "10px" }}>Not found</p>
        )}
    </ul>
</div>

                {/* Confirm Delete Button */}
                <div style={{ marginTop: "10px", paddingBottom: "20px" }}>
          {showDelete && (
            <button
              style={deleteButtonStyle}
              onClick={handleDeleteSelected}
            >
              Delete {Array.from(selectedToDelete)
                .map((id) => contacts.find(contact => contact.id === id)?.name)
                .filter(Boolean)
                .join(", ")}
            </button>
          )}
        </div>
            </div>

            {/* Chatbox or Welcome Message */}
            <div style={{ flex: 1, height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", backgroundColor: "#000b1f" }}>
                
                {/* Sparkles Background (Only show when no chat is open) */}
                {!selectedContact && (
                    <div style={{ 
                        position: "absolute", 
                        top: 0, 
                        left: 0, 
                        width: "100vw", 
                        height: "100vh", 
                        overflow: "hidden",  
                        pointerEvents: "none",
                        zIndex: 0 
                    }}>
                        <SparklesCore />
                    </div>
                )}

                {/* Main Content */}
                {selectedContact ? (
                    <Chatbox 
                        key={selectedContact.id}
                        selectedContact={selectedContact} 
                        goBack={() => setSelectedContact(null)} 
                        senderLanguage={defaultLanguage}
                        currentUserEmail={localStorage.getItem("userEmail") || ""}
                    />
                ) : (
                    <div style={{ textAlign: "center", zIndex: 1 }}>
                        <TextGenerateEffect words={`WELCOME ${username}`} duration={0.7} />

                        <TextGenerateEffect words="SELECT A CONTACT TO START CHATTING." duration={0.5} />
                    </div>
                )}
            </div>

            {showAddUserModal && (
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "#fff",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    zIndex: 1000,
                    width: "300px",
                }}>
                    <h2 style={{ textAlign: "center", marginBottom: "15px", color: "#333" }}>
                        Add New Contact
                    </h2>
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", color: "#333" }}>
                            Search by Email:
                        </label>
                        <input
                            type="email"
                            value={searchUserEmail}
                            onChange={(e) => setSearchUserEmail(e.target.value)}
                            placeholder="Enter email address"
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                                marginBottom: "5px"
                            }}
                        />
                        {searchError && (
                            <p style={{ color: "red", fontSize: "12px", margin: "5px 0" }}>
                                {searchError}
                            </p>
                        )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <button
                            onClick={handleSearchAndAddUser}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#6A95CC",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Add User
                        </button>
                        <button
                            onClick={() => setShowAddUserModal(false)}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#d9534f",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const buttonStyle: React.CSSProperties = {
    backgroundColor: "#1a2b4c",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif", 
    fontSize: "12px",
    fontWeight: "bold",
    marginTop: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center" as React.CSSProperties["textAlign"],
    alignSelf: "center",
    transition: "all 0.3s ease-in-out",  // Smooth transition for hover effect
};

const buttonHoverStyle: React.CSSProperties = {
    backgroundColor: "#2a3b5c", // Slightly lighter shade on hover
    transform: "scale(1.05)", // Slight enlargement on hover
};




const searchBarStyle = {
    width: "80%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "14px"
};

const clearButtonStyle = {
    background: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    marginLeft: "5px"
};

const contactStyle = {
    display: "flex",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#000b1f",
    borderRadius: "8px",
    marginBottom: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.2s"
};

const deleteButtonStyle: React.CSSProperties = {
    backgroundColor: "#d9534f",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif", 
    fontSize: "16px",
    fontWeight: "bold",
    marginTop: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
};


export default ContactsPage;