"use client";

import { useEffect, useState } from "react";
import axios from "axios";

function Test() {
  const [responseState, setResponse] = useState<any>([]);

  const testCall = async () => {
    const response = await axios.post("http://localhost:3001/generate", {
      prompt: "Hello there",
    });
    setResponse(response.data);
    console.log("res", response);
  };
  useEffect(() => {
    testCall();
  }, []);

  console.log(responseState);
  return (
    <div>
      <h1>hellow</h1>
    </div>
  );
}

export default Test;
