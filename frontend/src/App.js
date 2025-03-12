import axios from "axios";
import { useState } from "react";
import * as XLSX from "xlsx";

function App() {
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState(""); // For manually entered single email
  const [status, setStatus] = useState(false);
  const [emailList, setEmailList] = useState([]);

  function handleMsg(evt) {
    setMsg(evt.target.value);
  }

  function handleEmail(evt) {
    setEmail(evt.target.value);
  }

  function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON with proper formatting
      const emails = XLSX.utils
        .sheet_to_json(worksheet, { header: 1 })
        .flat()
        .filter((email) => typeof email === "string" && email.includes("@")); // Ensure valid emails

      setEmailList(emails);
      console.log("Extracted Emails:", emails);
    };

    reader.readAsBinaryString(file);
  }

  function send() {
    if (!msg.trim()) {
      alert("Please enter a message.");
      return;
    }

    if (!email && emailList.length === 0) {
      alert("Please enter an email or upload a list.");
      return;
    }

    setStatus(true);
    axios
      .post("http://localhost:5016/sendmail", { msg, email, emailList }) // Send single email and list
      .then((response) => {
        if (response.data.success) {
          alert("Emails sent successfully!");
        } else {
          alert(`Some emails failed: ${response.data.failedEmails.join(", ")}`);
        }
      })
      .catch((error) => {
        console.error("❌ Error sending emails:", error);
        alert("Failed to send emails.");
      })
      .finally(() => {
        setStatus(false);
      });
  }

  return (
    <div>
      <div className="bg-blue-950 text-white text-center">
        <h1 className="text-2xl font-medium px-5 py-3">BulkMail</h1>
      </div>

      <div className="bg-blue-800 text-white text-center">
        <h1 className="font-medium px-5 py-3">
          Send emails to a single recipient or multiple recipients at once.
        </h1>
      </div>

      <div className="bg-blue-400 flex flex-col items-center text-black px-5 py-3">
        <textarea
          onChange={handleMsg}
          value={msg}
          className="w-[80%] h-32 py-2 outline-none px-2 border border-black rounded-md"
          placeholder="Enter the email message..."
        ></textarea>

        <input
          type="text"
          onChange={handleEmail}
          value={email}
          placeholder="Enter a single email ID (optional)"
          className="w-[80%] py-2 outline-none px-2 border border-black rounded-md mt-3"
        />

        <input
          type="file"
          onChange={handleFile}
          className="border-4 border-dashed py-4 px-4 mt-5 mb-5"
        />

        <p>Total Emails in the file: {emailList.length}</p>

        <button
          onClick={send}
          className="mt-2 bg-blue-950 py-2 px-2 text-white font-medium rounded-md w-fit"
        >
          {status ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
