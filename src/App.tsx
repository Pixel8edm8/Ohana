
      <header className="navbar">
        <a href="#" className="logo">
          <img src="/images/OhanaLogo.png" alt="Ohana Family Tree" />
        </a>
        <span className="headerCaption">Simplicity..  Creativity...</span>
      </header>

      <main className="details">
        <section className="hero">
          <h1>Lets write<br />your story on the tree</h1>
        </section>

        <section className="options">
          <button className="option-card create-card" onClick={() => openLogin('create')}>
            <div className="card-top">
              <div className="card-icon create-icon">&#43;</div>
            </div>
            <div className="card-content">
              <span className="card-label">BUILD YOUR OHANA</span>
              <h2>Create a New Tree</h2>
            </div>
            <div className="card-footer">
              <span>Begin here</span>
              <span>→</span>
            </div>
          </button>

          <button className="option-card open-card" onClick={() => openLogin('open')}>
            <div className="card-top">
              <div className="card-icon open-icon">⌂</div>
            </div>
            <div className="card-content">
              <span className="card-label">WELCOME BACK</span>
              <h2>Open an Existing Tree</h2>
            </div>
            <div className="card-footer">
              <span>Continue building your tree</span>
              <span>→</span>
            </div>
          </button>
        </section>
      </main>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="login-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <button className="close-button" onClick={closeLogin} aria-label="Close login dialog">×</button>
            <p className="modal-eyebrow">WELCOME TO OHANA</p>
            <h2 id="modalTitle">
              {selectedAction === "create" ? "Create your family tree." : "Welcome back."}
            </h2>
            <p id="modalDescription">
              {selectedAction === "create" ? "Sign in to start." : "Sign in to access your existing family trees."}
            </p>
            <div className=''>
              <GoogleLogin 
              onSuccess={(credentialSuccess) => {
                console.log("Credential Success!");
                console.log(credentialSuccess.clientId);
                navigate('/tree');
              }}
              onError={() => {
                console.log("Damn. It didn't work.");
              }}
              ></GoogleLogin>
            </div>
          </div>
        </div>
      )}
    </>
      }></Route>
      {/* TODO: Fix this later so that we can give links for different trees. */}
      <Route path="/tree" element={<FamilyTree />}></Route>
    </Routes>
  );
}