import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";

function Dashboard() {
  // 🔹 Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [assignedTo, setAssignedTo] = useState("");

  // 🔹 Issues
  const [issues, setIssues] = useState([]);

  // 🔹 Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // 🔹 CREATE ISSUE + SIMILAR ISSUE DETECTION (FIXED)
  const handleCreateIssue = async (e) => {
    e.preventDefault();

    const newTitle = title.toLowerCase().trim();

    // ✅ Improved similarity logic (both directions)
    const similarIssue = issues.find((issue) => {
      const existingTitle = issue.title.toLowerCase().trim();
      return (
        existingTitle.includes(newTitle) ||
        newTitle.includes(existingTitle)
      );
    });

    if (similarIssue) {
      const proceed = window.confirm(
        "A similar issue already exists. Do you want to continue?"
      );
      if (!proceed) return;
    }

    try {
      await addDoc(collection(db, "issues"), {
        title,
        description,
        priority,
        status: "Open",
        assignedTo,
        createdBy: auth.currentUser.email,
        createdAt: serverTimestamp(),
      });

      alert("Issue created successfully");

      setTitle("");
      setDescription("");
      setPriority("Low");
      setAssignedTo("");
    } catch (error) {
      alert(error.message);
    }
  };

  // 🔹 FETCH ISSUES (Newest First)
  useEffect(() => {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issuesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIssues(issuesData);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 APPLY FILTERS
  const filteredIssues = issues.filter((issue) => {
    const statusMatch =
      statusFilter === "All" || issue.status === statusFilter;
    const priorityMatch =
      priorityFilter === "All" || issue.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  // 🔹 STATUS RULE (Open → Done not allowed)
  const handleStatusChange = async (issue, newStatus) => {
    if (issue.status === "Open" && newStatus === "Done") {
      alert(
        "Please move the issue to 'In Progress' before marking it as Done."
      );
      return;
    }

    try {
      const issueRef = doc(db, "issues", issue.id);
      await updateDoc(issueRef, { status: newStatus });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Logged in as: {auth.currentUser?.email}</p>

      {/* 🔹 CREATE ISSUE */}
      <h3>Create Issue</h3>
      <form onSubmit={handleCreateIssue}>
        <input
          type="text"
          placeholder="Issue Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br /><br />

        <textarea
          placeholder="Issue Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <br /><br />

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <br /><br />

        <input
          type="text"
          placeholder="Assigned To (email)"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
        />
        <br /><br />

        <button type="submit">Create Issue</button>
      </form>

      <hr />

      {/* 🔹 FILTERS */}
      <h3>Filters</h3>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option>All</option>
        <option>Open</option>
        <option>In Progress</option>
        <option>Done</option>
      </select>

      <select
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
        style={{ marginLeft: "10px" }}
      >
        <option>All</option>
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      <hr />

      {/* 🔹 ISSUE LIST */}
      <h3>All Issues</h3>

      {filteredIssues.length === 0 && <p>No issues found</p>}

      {filteredIssues.map((issue) => (
        <div
          key={issue.id}
          style={{
            border: "1px solid gray",
            padding: "10px",
            margin: "10px 0",
          }}
        >
          <h4>{issue.title}</h4>
          <p>{issue.description}</p>
          <p><strong>Priority:</strong> {issue.priority}</p>

          <p>
            <strong>Status:</strong>{" "}
            <select
              value={issue.status}
              onChange={(e) =>
                handleStatusChange(issue, e.target.value)
              }
            >
              <option>Open</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </p>

          <p><strong>Assigned To:</strong> {issue.assignedTo}</p>
          <p><strong>Created By:</strong> {issue.createdBy}</p>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
