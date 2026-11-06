import ReactDOM from "react-dom/client";

import Root from "./Root";
import { initAnalytics } from "./lib/analytics";

import "./index.css";

// The built HTML already holds a prerendered copy of the page (for crawlers and
// first paint); createRoot replaces it with the live app.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <Root path={window.location.pathname} />
);

// optional analytics and marketing tags; they start only after the visitor consents
initAnalytics();
