export default function Template() {
    return (
    <header className="navbar">
        <a href="#" className="logo">
          <img src={import.meta.env.BASE_URL + "images/OhanaLogo.png"} alt="Ohana Family Tree" />
        </a>
        {/* TODO: Pretty please change this slogan! */}
        <span className="headerCaption">Simplicity. Creativity.</span>
    </header>
    );   
}