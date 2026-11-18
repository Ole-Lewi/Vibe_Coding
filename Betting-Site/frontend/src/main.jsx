import{ Strictmode, Component } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

class boundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <pre style={{ color: "#f87171", padding: 16, whiteSpace: "pre-wrap"}}>
        {String(this.state.error.stack || this.state.error)}
      </pre>
    ) : (
      this.props.children
    );
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Boundary>
      <App />
    </Boundary>
  </StrictMode>
);