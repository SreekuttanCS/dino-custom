export default function Input({ label, type = "text", value, onChange, placeholder, required = false }) {
    return (
        <div className="mb-6 font-arcade">
            <label className="block text-[#535353] text-xs mb-2 uppercase tracking-wider">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full bg-[#f7f7f7] text-[#535353] border-b-2 border-[#535353] py-2 px-2 text-sm focus:outline-none focus:border-black placeholder-gray-400 font-sans"
            />
        </div>
    );
}
