import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const roles = [
  { icon: "✦", title: "Super Admin", text: "Platform-level control and configuration." },
  { icon: "▦", title: "Company Admin", text: "Manage companies, branches and users." },
  { icon: "◉", title: "Employee", text: "Create requests and track purchases." },
  { icon: "✓", title: "Manager", text: "Review and approve purchase requests." },
  { icon: "₹", title: "Finance", text: "Process payments and manage invoices." },
  { icon: "◆", title: "Supplier", text: "Manage products and fulfil orders." },
];

const features = [
  ["01", "Purchase Requests", "Create, submit and track requests through a structured approval flow."],
  ["02", "Supplier & Products", "Keep supplier information and product details organized in one place."],
  ["03", "Purchase Orders", "Move approved requests into the ordering process and follow order progress."],
  ["04", "Payments & Invoices", "Give the finance team a focused workspace for payment and invoice processing."],
];

const steps = [
  ["Request", "Employee creates a purchase request."],
  ["Approve", "Manager reviews and approves."],
  ["Order", "Purchase order moves to supplier."],
  ["Pay", "Finance processes the payment."],
  ["Deliver", "Supplier fulfils the order."],
];

export default function LandingPage() {
  const navigate = useNavigate();
  const goLogin = () => navigate("/login");

  return (
    <main className="ph-landing">
      <header className="ph-header">
        <div className="ph-header-inner">
          <button className="ph-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span className="ph-brand-mark">P</span>
            <span>ProcureHub</span>
          </button>
          <nav className="ph-nav">
            <a href="#about">About</a>
            <a href="#workflow">How it works</a>
            <a href="#features">Features</a>
            
          </nav>
          <button className="ph-login" onClick={goLogin}>Login</button>
        </div>
      </header>

      <section className="ph-hero">
        <div className="ph-hero-inner">
          <div className="ph-hero-copy">
            <span className="ph-badge"><i /> B2B procurement platform</span>
            <h1>Procurement made <span>beautifully simple.</span></h1>
            <p>
              Connect purchase requests, approvals, suppliers, orders, payments and delivery
              in one clear procurement workflow.
            </p>
            <div className="ph-hero-actions">
              <button className="ph-primary" onClick={goLogin}>Enter ProcureHub</button>
              <a className="ph-secondary" href="#workflow">See how it works</a>
            </div>
            <ul className="ph-mini-points">
              <li>Multi-company</li>
              <li>Multi-branch</li>
              <li>Role-based access</li>
            </ul>
          </div>

          <div className="ph-hero-art">
            <div className="ph-dashboard">
              <div className="ph-dash-top">
                <span className="ph-dot" /><span className="ph-dot" /><span className="ph-dot" />
                <div className="ph-dash-search">Search anything...</div>
                <div className="ph-avatar">S</div>
              </div>
              <div className="ph-dash-body">
                <aside>
                  <div className="active">Dashboard</div>
                  <div>Requests</div>
                  <div>Orders</div>
                  <div>Suppliers</div>
                  <div>Payments</div>
                </aside>
                <div className="ph-dash-content">
                  <div className="ph-dash-heading">
                    <strong>Procurement workspace</strong>
                    <span className="ph-date">Today</span>
                  </div>
                  <div className="ph-stat-row">
                    <div><small>Requests</small><b>12</b><em>Pending</em></div>
                    <div><small>Orders</small><b>28</b><em>Active</em></div>
                    <div><small>Suppliers</small><b>15</b><em>Connected</em></div>
                  </div>
                  <div className="ph-table">
                    <div className="ph-table-head"><span>Recent requests</span><span>Status</span></div>
                    <div><span>PR-001 · Laptops for IT</span><i className="pending">Pending</i></div>
                    <div><span>PR-002 · Office stationery</span><i className="approved">Approved</i></div>
                    <div><span>PR-003 · Printer supplies</span><i className="processing">Processing</i></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="ph-float ph-float-one"><span>✓</span><div><b>Request approved</b><small>Manager · just now</small></div></div>
            <div className="ph-float ph-float-two"><span>₹</span><div><b>Payment processed</b><small>Finance · completed</small></div></div>
          </div>
        </div>
      </section>

      <section id="about" className="ph-section ph-about">
        <div className="ph-container ph-about-grid">
          <div>
            <span className="ph-tag">Why ProcureHub</span>
            <h2>One platform for every procurement step.</h2>
            <p>
              ProcureHub connects the people and processes involved in business purchasing.
              From the first request to the final delivery, each stage has a clear place in the workflow.
            </p>
            <ul className="ph-about-lines">
              <li><b>1</b><span>Centralized procurement workspace</span></li>
              <li><b>2</b><span>Structured request and approval flow</span></li>
              <li><b>3</b><span>Connected supplier, order and finance process</span></li>
            </ul>
          </div>
          <div className="ph-about-card">
            <div className="ph-card-top"><span>Procurement flow</span><b>Live</b></div>
            <div className="ph-flow-mini">
              <div className="done">✓</div><span>Request</span><i />
              <div className="done">✓</div><span>Approve</span><i />
              <div className="active">3</div><span>Order</span>
            </div>
            <div className="ph-progress"><span /></div>
            <small>Order is moving through the workflow</small>
          </div>
        </div>
      </section>

      <section id="workflow" className="ph-section ph-workflow">
        <div className="ph-container">
          <div className="ph-center">
            <span className="ph-tag">The procurement journey</span>
            <h2>From request to delivery.</h2>
            <p className="ph-intro">A simple connected flow for the complete purchasing lifecycle.</p>
          </div>
          <div className="ph-journey">
            {steps.map(([title, text], i) => (
              <div className="ph-journey-item" key={title}>
                <div className="ph-journey-num">{i + 1}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="ph-section ph-features">
        <div className="ph-container">
          <div className="ph-center">
            <span className="ph-tag">Core capabilities</span>
            <h2>Built around your real workflow.</h2>
            <p className="ph-intro">Everything is organized around the way procurement actually moves through a business.</p>
          </div>
          <div className="ph-feature-grid">
            {features.map(([number, title, text]) => (
              <article className="ph-feature" key={number}>
                <span className="ph-feature-num">{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

     

      <section className="ph-cta-wrap">
        <div className="ph-cta">
          <h2>Ready to make procurement effortless?</h2>
          <p>Step into ProcureHub and experience one connected procurement workflow.</p>
          <button className="ph-primary light" onClick={goLogin}>Login to ProcureHub</button>
        </div>
      </section>

      <footer className="ph-footer">
        <div className="ph-footer-inner">
          <div>
            <div className="ph-brand footer-brand"><span className="ph-brand-mark">P</span><span>ProcureHub</span></div>
            <p>B2B procurement, connected.</p>
          </div>
          <div className="ph-footer-links">
            <a href="#about">About</a>
            <a href="#workflow">How it works</a>
            <a href="#features">Features</a>
            <button onClick={goLogin}>Login</button>
          </div>
          <small>© {new Date().getFullYear()} ProcureHub. All rights reserved.</small>
        </div>
      </footer>
    </main>
  );
}
