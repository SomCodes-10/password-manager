import React, { useEffect, useState } from 'react'
import Logo from './Logo'
import PassIcon from './PassIcon'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { v4 as uuidv4 } from "uuid";

const Manager = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setform] = useState({ site: "", username: "", password: "" })
  const [passwordArray, setPasswordArray] = useState([])
  const [copyMessage, setCopyMessage] = useState("")

  const getPass = async () => {
    let req = await fetch("http://localhost:3000/")
    const passwords = await req.json()
    console.log(passwords)
    setPasswordArray(passwords)
  }
  

  useEffect(() => {
    getPass()
    
  }, [])

  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value })
  }

  const savePassword = async () => { // FIXED: Added 'async' here
  let updatedArray;
  
  // Create a clean object representing the record we want to save
  // If it already has an ID (editing), keep it. If not (new entry), generate ONE unique ID.
  const finalEntry = form.id ? form : { ...form, id: uuidv4() };

  // 1. Determine what the new local state array should look like
  if (form.id) {
    // Editing: Map through and swap out the old item with our updated one
    updatedArray = passwordArray.map(item => item.id === form.id ? finalEntry : item);
  } else {
    // New entry: Append our new finalEntry to the end of the array
    updatedArray = [...passwordArray, finalEntry];
  }

  try {
    // 2. Send the exact same data object to your backend database and AWAIT the confirmation
    let res = await fetch("http://localhost:3000/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalEntry) // FIXED: Sends finalEntry with the correct, stable ID
    });

    if (res.ok) {
      // 3. Only update the UI state and clear the input form if the database safely saved it!
      setPasswordArray(updatedArray);
      setform({ site: "", username: "", password: "" });

      toast.success('Password Saved Successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    } else {
      toast.error('Failed to save password to server.');
    }
  } catch (error) {
    console.error("Network error saving password:", error);
    toast.error('Server connection error.');
  }
};

  const handleEdit = async (id) => {
  const editItem = passwordArray.find(item => item.id === id);
  if (editItem) {
    setform(editItem);
    
    // 1. Instantly filter it out of the local state array
    const updatedArray = passwordArray.filter(item => item.id !== id);
    setPasswordArray(updatedArray);
    
    // 2. Remove the old copy from MongoDB immediately 
    await fetch("http://localhost:3000/", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
  }
};
  const handleDelete = async (id) => {
  const isConfirmed = window.confirm("Are you sure you want to delete this password entry?");
  if (!isConfirmed) return;

  // 1. Filter out the deleted item from your local state tracking array
  const updatedArray = passwordArray.filter(item => item.id !== id);

  try {
    // 2. Fire the delete request to your server, sending ONLY the matching ID
    let res = await fetch("http://localhost:3000/", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }) // FIXED: Packaged the actual target parameter 'id' securely 
    });

    if (res.ok) {
      // 3. Only update the UI panel array if the database successfully drops the document
      setPasswordArray(updatedArray);
      
      toast.success('Password Deleted Successfully!', {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
        transition: Bounce,
      });
    } else {
      toast.error('Failed to delete password from server.');
    }
  } catch (error) {
    console.error("Network error deleting password:", error);
    toast.error('Server connection error.');
  }
};

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast('Copied to Clipboard!', {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  }

  return (
    <div>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      
      <div className="fixed inset-0 -z-10 min-h-screen w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]"></div>

      {/* RESPONSIVE FIX: px-3 on mobile prevents content from touching screen edges */}
      <div className="myContainer max-w-4xl mx-auto px-3 sm:px-4 py-4">
        <Logo />
        <p className="text-slate-800 font-medium my-2">Your own Password manager</p>

        {/* RESPONSIVE FIX: tighter gap on mobile (gap-4) */}
        <div className="text-black flex flex-col gap-4 sm:gap-5 mt-4"> 
          <input
            value={form.site}
            onChange={handleChange}
            className="border-2 border-purple-400 bg-white text-black rounded-2xl px-3 sm:px-4 py-2 outline-none w-full text-sm sm:text-base"
            type="text"
            name="site"
            placeholder="Enter website URL"
          />
          
          {/* RESPONSIVE FIX: gap-4 on mobile matches the outer gap change */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-5"> 
            <input
              value={form.username}
              onChange={handleChange}
              className="border-2 border-purple-400 bg-white text-black rounded-xl px-3 sm:px-4 py-2 outline-none w-full text-sm sm:text-base"
              type="text"
              name="username"
              placeholder="Username"
            />
            <div className="relative w-full flex items-center">
              <input
                value={form.password}
                onChange={handleChange}
                className="border-2 border-purple-400 bg-white text-black rounded-xl px-3 sm:px-4 py-2 pr-12 outline-none w-full text-sm sm:text-base"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
              />
              {/* RESPONSIVE FIX: right-2 on mobile gives the toggle button breathing room */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 sm:right-3 p-1 flex items-center justify-center text-slate-500 focus:outline-none"
              >
                <PassIcon showPassword={showPassword} />
              </button>
            </div>
          </div>
        </div>

        {/* RESPONSIVE FIX: w-full on mobile makes the button a full-width tap target */}
        <button
          onClick={savePassword}
         className='w-max mx-auto sm:mx-0 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold mt-6 sm:mt-10 transition-all'
        >
          <span>Add Password</span>
        </button>
      </div>

      {/* RESPONSIVE FIX: px-3 on mobile to match the form section's edge padding above */}
      <div className="passwords max-w-4xl mx-auto px-3 sm:px-4 py-4 mt-4 sm:mt-6 text-center"> 
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 inline-block"> 
          Your Passwords
        </h2>

        {passwordArray.length === 0 ? (
          <div className="text-slate-500 font-medium my-5">No passwords saved yet</div>
        ) : (
          /* RESPONSIVE FIX: -mx-1 on mobile bleeds the table slightly to reclaim padding */
          <div className="overflow-x-auto rounded-xl border border-purple-200 text-left -mx-1 sm:mx-0"> 
            {/* RESPONSIVE FIX: min-w-[480px] ensures the table never collapses below a readable width */}
            <table className="w-full min-w-[480px] bg-white text-sm text-slate-700"> 
              <thead className="bg-purple-100 text-purple-900 uppercase text-xs font-semibold">
                <tr>
                  {/* RESPONSIVE FIX: px-3 py-3 on mobile reduces column padding */}
                  <th className="px-3 sm:px-6 py-3">Site</th>
                  <th className="px-3 sm:px-6 py-3">Username</th>
                  <th className="px-3 sm:px-6 py-3">Password</th>
                  <th className="px-3 sm:px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {passwordArray.map((item) => (
                  /* FIXED: Using unique item.id instead of index for stable DOM mapping */
                  <tr key={item.id} className="hover:bg-purple-50/50">

                    {/* Site Link URL Column */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4"> 
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={item.site.startsWith('http://') || item.site.startsWith('https://') ? item.site : `https://${item.site}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-600 hover:underline truncate max-w-[120px] sm:max-w-[160px]"
                        >
                          {item.site}
                        </a>
                        <button
                          onClick={() => copyToClipboard(item.site)}
                          className="text-slate-400 hover:text-purple-600 cursor-pointer p-1 rounded hover:bg-slate-100 flex-shrink-0"
                          title="Copy Website Link"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376A8.965 8.965 0 0012 12.75c-.497 0-.982.04-1.455.12l-.179.032m7.374.573L8.7 17.83a.45.45 0 01-.18.09l-3.42 1.14a.45.45 0 01-.57-.57L5.67 15.07a.45.45 0 01.09-.18l7.15-7.15m4.73 4.73L12.75 7.5" />
                          </svg>
                        </button>
                      </div>
                    </td>

                    {/* Username Column */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4"> 
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate max-w-[100px] sm:max-w-[130px]">{item.username}</span>
                        <button
                          onClick={() => copyToClipboard(item.username)}
                          className="text-slate-400 hover:text-purple-600 cursor-pointer p-1 rounded hover:bg-slate-100 flex-shrink-0"
                          title="Copy Username"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376A8.965 8.965 0 0012 12.75c-.497 0-.982.04-1.455.12l-.179.032m7.374.573L8.7 17.83a.45.45 0 01-.18.09l-3.42 1.14a.45.45 0 01-.57-.57L5.67 15.07a.45.45 0 01.09-.18l7.15-7.15m4.73 4.73L12.75 7.5" />
                          </svg>
                        </button>
                      </div>
                    </td>

                    {/* Password Column */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4"> 
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate max-w-[80px] sm:max-w-[120px]">{"•".repeat(item.password?.length || 0)}</span>
                        <button
                          onClick={() => copyToClipboard(item.password)}
                          className="text-slate-400 hover:text-purple-600 cursor-pointer p-1 rounded hover:bg-slate-100 flex-shrink-0"
                          title="Copy Password"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376A8.965 8.965 0 0012 12.75c-.497 0-.982.04-1.455.12l-.179.032m7.374.573L8.7 17.83a.45.45 0 01-.18.09l-3.42 1.14a.45.45 0 01-.57-.57L5.67 15.07a.45.45 0 01.09-.18l7.15-7.15m4.73 4.73L12.75 7.5" />
                          </svg>
                        </button>
                      </div>
                    </td>

                    {/* Core Actions */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                      <div className="flex justify-center items-center gap-2 sm:gap-3"> 
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="p-1 sm:p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 sm:p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Manager