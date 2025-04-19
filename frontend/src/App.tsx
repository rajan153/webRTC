import { Route, Routes } from "react-router-dom";
import Sender from "./components/Sender";
import Receiver from "./components/Receiver";
import Home from "./components/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sender" element={<Sender />} />
      <Route path="/receiver" element={<Receiver />} />
    </Routes>
  );
}

export default App;
