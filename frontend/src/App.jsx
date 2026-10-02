import { useEffect, useState } from "react";

import {
    registerServiceWorker,
    subscribeToPush,
} from "./pushNotifications";


const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


function App() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loggedIn, setLoggedIn] = useState(
        Boolean(localStorage.getItem("access"))
    );

    const [message, setMessage] = useState("");

    const [triggers, setTriggers] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [editingTemplate, setEditingTemplate] = useState(null);

    const [formData, setFormData] = useState({
        trigger: "",
        channel: "email",
        name: "",
        subject: "",
        body: "",
        is_enabled: true,
        variables: [],
    });


    // --------------------------------------------------
    // LOGIN
    // --------------------------------------------------

    const login = async (event) => {
        event.preventDefault();

        try {
            setMessage("Logging in...");

            const response = await fetch(
                `${API_URL}/api/auth/login/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    data.error ||
                    "Login failed."
                );
            }

            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);

            setLoggedIn(true);
            setMessage("Login successful!");

        } catch (error) {
            console.error(error);
            setMessage(error.message);
        }
    };


    // --------------------------------------------------
    // LOAD ADMIN NOTIFICATIONS
    // --------------------------------------------------

    const loadNotifications = async () => {
        try {
            const accessToken =
                localStorage.getItem("access");

            const response = await fetch(
                `${API_URL}/api/notifications/admin/`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    data.error ||
                    "Failed to load notifications."
                );
            }

            setTriggers(data);

        } catch (error) {
            console.error(error);
            setMessage(error.message);
        }
    };


    useEffect(() => {
        if (loggedIn) {
            loadNotifications();
        }
    }, [loggedIn]);


    // --------------------------------------------------
    // ENABLE WEB PUSH
    // --------------------------------------------------

    const enableNotifications = async () => {
        try {
            const accessToken =
                localStorage.getItem("access");

            if (!accessToken) {
                setMessage("Please login first.");
                return;
            }

            setMessage(
                "Enabling notifications..."
            );

            await registerServiceWorker();

            const subscription =
                await subscribeToPush();

            const response = await fetch(
                `${API_URL}/api/notifications/push/subscribe/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization:
                            `Bearer ${accessToken}`,
                    },
                    body:
                        JSON.stringify(subscription),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to save subscription."
                );
            }

            setMessage(
                "Web notifications enabled successfully!"
            );

        } catch (error) {
            console.error(error);
            setMessage(error.message);
        }
    };


    // --------------------------------------------------
    // TEST WEB PUSH
    // --------------------------------------------------

    const testPush = async () => {
        try {
            setMessage(
                "Sending test notification..."
            );

            const accessToken =
                localStorage.getItem("access");

            const response = await fetch(
                `${API_URL}/api/notifications/push/test/`,
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to send notification."
                );
            }

            setMessage(data.message);

        } catch (error) {
            console.error(error);
            setMessage(error.message);
        }
    };


    // --------------------------------------------------
    // LOGOUT
    // --------------------------------------------------

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        setLoggedIn(false);
        setTriggers([]);

        setMessage("Logged out.");
    };


    // --------------------------------------------------
    // OPEN CREATE FORM
    // --------------------------------------------------

    const openCreateForm = () => {
        setEditingTemplate(null);

        setFormData({
            trigger:
                triggers.length > 0
                    ? triggers[0].id
                    : "",
            channel: "email",
            name: "",
            subject: "",
            body: "",
            is_enabled: true,
            variables: [],
        });

        setShowForm(true);
    };


    // --------------------------------------------------
    // OPEN EDIT FORM
    // --------------------------------------------------

    const openEditForm = (template) => {
        setEditingTemplate(template);

        setFormData({
            trigger: template.trigger,
            channel: template.channel,
            name: template.name,
            subject: template.subject || "",
            body: template.body,
            is_enabled: template.is_enabled,
            variables: template.variables || [],
        });

        setShowForm(true);
    };


    // --------------------------------------------------
    // SAVE TEMPLATE
    // --------------------------------------------------

    const saveTemplate = async (event) => {
        event.preventDefault();

        try {
            const accessToken =
                localStorage.getItem("access");

            const url = editingTemplate
                ? `${API_URL}/api/notifications/admin/templates/${editingTemplate.id}/`
                : `${API_URL}/api/notifications/admin/templates/`;

            const method =
                editingTemplate
                    ? "PUT"
                    : "POST";

            const response = await fetch(
                url,
                {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization:
                            `Bearer ${accessToken}`,
                    },
                    body:
                        JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    JSON.stringify(data)
                );
            }

            setMessage(
                editingTemplate
                    ? "Template updated successfully."
                    : "Template created successfully."
            );

            setShowForm(false);

            await loadNotifications();

        } catch (error) {
            console.error(error);
            setMessage(error.message);
        }
    };


    // --------------------------------------------------
    // TOGGLE TEMPLATE
    // --------------------------------------------------

    const toggleTemplate = async (template) => {
        try {
            const accessToken =
                localStorage.getItem("access");

            const response = await fetch(
                `${API_URL}/api/notifications/admin/templates/${template.id}/toggle/`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to update template."
                );
            }

            setMessage(data.message);

            await loadNotifications();

        } catch (error) {
            console.error(error);
            setMessage(error.message);
        }
    };


    // --------------------------------------------------
    // TEST TEMPLATE
    // --------------------------------------------------

    const testTemplate = async (template) => {
        try {
            const accessToken =
                localStorage.getItem("access");

            const response = await fetch(
                `${API_URL}/api/notifications/admin/templates/${template.id}/test/`,
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Test failed."
                );
            }

            setMessage(
                data.message
            );

        } catch (error) {
            console.error(error);
            setMessage(error.message);
        }
    };


    // --------------------------------------------------
    // LOGIN PAGE
    // --------------------------------------------------

    if (!loggedIn) {
        return (
            <div
                style={{
                    padding: "40px",
                    maxWidth: "500px",
                    margin: "auto",
                }}
            >
                <h1>
                    Notification System
                </h1>

                <h2>
                    Admin Login
                </h2>

                <form onSubmit={login}>

                    <div
                        style={{
                            marginBottom: "15px",
                        }}
                    >
                        <label>
                            Username
                        </label>

                        <br />

                        <input
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(
                                    event.target.value
                                )
                            }
                            required
                        />
                    </div>


                    <div
                        style={{
                            marginBottom: "15px",
                        }}
                    >
                        <label>
                            Password
                        </label>

                        <br />

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            required
                        />
                    </div>


                    <button type="submit">
                        Login
                    </button>

                </form>

                <p>
                    {message}
                </p>
            </div>
        );
    }


    // --------------------------------------------------
    // ADMIN DASHBOARD
    // --------------------------------------------------

    return (
        <div
            style={{
                padding: "30px",
                fontFamily: "Arial",
            }}
        >

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                    marginBottom: "25px",
                }}
            >

                <h1>
                    Notification Management
                </h1>

                <button onClick={logout}>
                    Logout
                </button>

            </div>


            <div
                style={{
                    marginBottom: "25px",
                }}
            >

                <button
                    onClick={openCreateForm}
                >
                    + Add Template
                </button>

                <button
                    onClick={enableNotifications}
                    style={{
                        marginLeft: "10px",
                    }}
                >
                    Enable Web Notifications
                </button>

                <button
                    onClick={testPush}
                    style={{
                        marginLeft: "10px",
                    }}
                >
                    Send Test Push
                </button>

            </div>


            {message && (
                <div
                    style={{
                        marginBottom: "20px",
                        padding: "10px",
                        background: "#f1f1f1",
                    }}
                >
                    {message}
                </div>
            )}


            {/* --------------------------------------- */}
            {/* CREATE / EDIT FORM */}
            {/* --------------------------------------- */}

            {showForm && (
                <div
                    style={{
                        border: "1px solid #ccc",
                        padding: "20px",
                        marginBottom: "30px",
                        maxWidth: "700px",
                    }}
                >

                    <h2>
                        {editingTemplate
                            ? "Edit Template"
                            : "Create Template"}
                    </h2>


                    <form
                        onSubmit={saveTemplate}
                    >

                        <div
                            style={{
                                marginBottom: "15px",
                            }}
                        >
                            <label>
                                Trigger
                            </label>

                            <br />

                            <select
                                value={formData.trigger}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        trigger:
                                            event.target.value,
                                    })
                                }
                            >

                                {triggers.map(
                                    (trigger) => (
                                        <option
                                            key={
                                                trigger.id
                                            }
                                            value={
                                                trigger.id
                                            }
                                        >
                                            {trigger.name}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>


                        <div
                            style={{
                                marginBottom: "15px",
                            }}
                        >

                            <label>
                                Channel
                            </label>

                            <br />

                            <select
                                value={
                                    formData.channel
                                }
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        channel:
                                            event.target.value,
                                    })
                                }
                            >

                                <option value="email">
                                    Email
                                </option>

                                <option value="web_push">
                                    Web Push
                                </option>

                                <option value="whatsapp">
                                    WhatsApp
                                </option>

                            </select>

                        </div>


                        <div
                            style={{
                                marginBottom: "15px",
                            }}
                        >

                            <label>
                                Template Name
                            </label>

                            <br />

                            <input
                                type="text"
                                value={
                                    formData.name
                                }
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        name:
                                            event.target.value,
                                    })
                                }
                                required
                            />

                        </div>


                        <div
                            style={{
                                marginBottom: "15px",
                            }}
                        >

                            <label>
                                Subject
                            </label>

                            <br />

                            <input
                                type="text"
                                value={
                                    formData.subject
                                }
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        subject:
                                            event.target.value,
                                    })
                                }
                            />

                        </div>


                        <div
                            style={{
                                marginBottom: "15px",
                            }}
                        >

                            <label>
                                Body
                            </label>

                            <br />

                            <textarea
                                rows="6"
                                cols="60"
                                value={
                                    formData.body
                                }
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        body:
                                            event.target.value,
                                    })
                                }
                                required
                            />

                        </div>


                        <div
                            style={{
                                marginBottom: "15px",
                            }}
                        >

                            <label>
                                <input
                                    type="checkbox"
                                    checked={
                                        formData.is_enabled
                                    }
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            is_enabled:
                                                event.target.checked,
                                        })
                                    }
                                />

                                {" "}Enabled

                            </label>

                        </div>


                        <button type="submit">
                            Save
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setShowForm(false)
                            }
                            style={{
                                marginLeft: "10px",
                            }}
                        >
                            Cancel
                        </button>

                    </form>

                </div>
            )}


            {/* --------------------------------------- */}
            {/* ADMIN TABLE */}
            {/* --------------------------------------- */}

            <table
                style={{
                    width: "100%",
                    borderCollapse:
                        "collapse",
                }}
            >

                <thead>

                    <tr>

                        <th
                            style={{
                                border:
                                    "1px solid #ccc",
                                padding: "12px",
                                textAlign:
                                    "left",
                            }}
                        >
                            Trigger
                        </th>

                        <th
                            style={{
                                border:
                                    "1px solid #ccc",
                                padding: "12px",
                            }}
                        >
                            WhatsApp
                        </th>

                        <th
                            style={{
                                border:
                                    "1px solid #ccc",
                                padding: "12px",
                            }}
                        >
                            Email
                        </th>

                        <th
                            style={{
                                border:
                                    "1px solid #ccc",
                                padding: "12px",
                            }}
                        >
                            Web Push
                        </th>

                    </tr>

                </thead>


                <tbody>

                    {triggers.map(
                        (trigger) => {

                            const getTemplate =
                                (channel) =>
                                    trigger.templates.find(
                                        (template) =>
                                            template.channel ===
                                            channel
                                    );

                            return (
                                <tr
                                    key={
                                        trigger.id
                                    }
                                >

                                    <td
                                        style={{
                                            border:
                                                "1px solid #ccc",
                                            padding:
                                                "12px",
                                            fontWeight:
                                                "bold",
                                        }}
                                    >
                                        {trigger.name}
                                    </td>


                                    {[
                                        "whatsapp",
                                        "email",
                                        "web_push",
                                    ].map(
                                        (channel) => {

                                            const template =
                                                getTemplate(
                                                    channel
                                                );

                                            return (
                                                <td
                                                    key={
                                                        channel
                                                    }
                                                    style={{
                                                        border:
                                                            "1px solid #ccc",
                                                        padding:
                                                            "12px",
                                                        verticalAlign:
                                                            "top",
                                                    }}
                                                >

                                                    {template ? (

                                                        <div>

                                                            <div>
                                                                <strong>
                                                                    {
                                                                        template.name
                                                                    }
                                                                </strong>
                                                            </div>

                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "5px",
                                                                }}
                                                            >
                                                                {template.is_enabled
                                                                    ? "🟢 Enabled"
                                                                    : "🔴 Disabled"}
                                                            </div>

                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "10px",
                                                                }}
                                                            >

                                                                <button
                                                                    onClick={() =>
                                                                        openEditForm(
                                                                            template
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    onClick={() =>
                                                                        toggleTemplate(
                                                                            template
                                                                        )
                                                                    }
                                                                    style={{
                                                                        marginLeft:
                                                                            "5px",
                                                                    }}
                                                                >
                                                                    {template.is_enabled
                                                                        ? "Disable"
                                                                        : "Enable"}
                                                                </button>

                                                                <button
                                                                    onClick={() =>
                                                                        testTemplate(
                                                                            template
                                                                        )
                                                                    }
                                                                    style={{
                                                                        marginLeft:
                                                                            "5px",
                                                                    }}
                                                                >
                                                                    Test
                                                                </button>

                                                            </div>

                                                        </div>

                                                    ) : (

                                                        <button
                                                            onClick={() => {
                                                                setEditingTemplate(
                                                                    null
                                                                );

                                                                setFormData({
                                                                    trigger:
                                                                        trigger.id,
                                                                    channel,
                                                                    name:
                                                                        `${trigger.name} ${channel} Template`,
                                                                    subject:
                                                                        "",
                                                                    body:
                                                                        "",
                                                                    is_enabled:
                                                                        true,
                                                                    variables:
                                                                        [],
                                                                });

                                                                setShowForm(
                                                                    true
                                                                );
                                                            }}
                                                        >
                                                            + Create
                                                        </button>

                                                    )}

                                                </td>
                                            );
                                        }
                                    )}

                                </tr>
                            );
                        }
                    )}

                </tbody>

            </table>

        </div>
    );
}


export default App;