export default function Button({ children, onClick, type = "button", variant = "primary", disabled = false, ...props }) {
    // Retro styles based on Game.jsx and index.css
    const baseStyle = "font-arcade px-6 py-3 border-2 border-[#535353] text-sm uppercase tracking-widest transition-none focus:outline-none";

    const variants = {
        primary: "bg-[#f7f7f7] text-[#535353] hover:bg-[#535353] hover:text-[#f7f7f7] active:bg-black",
        secondary: "bg-transparent text-[#535353] border-dashed hover:bg-[#e0e0e0]",
        danger: "bg-[#535353] text-white hover:bg-black border-black",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${props.className || ''}`}
        >
            {children}
        </button>
    );
}
