import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import API from "../api/axios";

import kasiImg from "../assets/chars/kasi.png";
import pranavImg from "../assets/chars/pranav.png";
import akhilImg from "../assets/chars/akhil.png";
import vishalImg from "../assets/chars/vishal.png";

const CHARACTERS = [
  { id: 0, name: "Kasi", img: kasiImg },
  { id: 1, name: "Pranav", img: pranavImg },
  { id: 2, name: "Akhil", img: akhilImg },
  { id: 3, name: "Vishal", img: vishalImg },
  // { id: 4, name: "Custom", isCustom: true }, // CUSTOM CHARACTER
];

export default function CharacterSelect() {
  // const { user, updateCharacter } = useAuth();
  const [selectedId, setSelectedId] = useState(0);
  // const [uploading, setUploading] = useState(false); // CUSTOM
  const navigate = useNavigate();

  // const [faceFile, setFaceFile] = useState(null);
  // const [runSoundFile, setRunSoundFile] = useState(null);
  // const [hitSoundFile, setHitSoundFile] = useState(null);

  // const handleCustomUpload = async (e) => {
  //   e.preventDefault();
  //   if (!faceFile || !runSoundFile || !hitSoundFile) {
  //     alert("Please select all files for custom character");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("face", faceFile);
  //   formData.append("runSound", runSoundFile);
  //   formData.append("hitSound", hitSoundFile);

  //   setUploading(true);
  //   try {
  //     await updateCharacter(formData);
  //     alert("Custom character updated!");
  //     setSelectedId(4);
  //   } catch (error) {
  //     console.error(error);
  //     alert("Failed to upload");
  //   }
  //   setUploading(false);
  // };

  const startGame = () => {
    navigate("/game", { state: { characterId: selectedId } });
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-arcade flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl text-[#535353] mb-4 tracking-widest">
            SELECT DRIVER
          </h1>
          <p className="text-[#535353] text-[10px] uppercase">
            Use Cursor to Select
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          {CHARACTERS.map((char) => (
            <div
              key={char.id}
              onClick={() => setSelectedId(char.id)}
              className={`
                relative p-4 border-4 cursor-pointer transition-all duration-0
                flex flex-col items-center
                ${
                  selectedId === char.id
                    ? "border-[#535353] bg-[#535353] text-white scale-110 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
                    : "border-[#535353] bg-white text-[#535353] hover:bg-gray-100"
                }
              `}
            >
              <div
                className={`w-24 h-24 md:w-28 md:h-28 mb-4 flex items-center justify-center overflow-hidden border-2 ${
                  selectedId === char.id
                    ? "border-white bg-[#535353]"
                    : "border-[#535353] bg-[#f7f7f7]"
                }`}
              >
                {/* ================= CUSTOM CHARACTER IMAGE ================= */}
                {/* {char.isCustom ? (
                  user?.customCharacter?.face ? (
                    <img
                      src={`http://localhost:5000/${user.customCharacter.face.replace(
                        /\\/g,
                        "/"
                      )}?t=${Date.now()}`}
                      alt="Custom"
                      className="w-full h-full object-cover grayscale"
                    />
                  ) : (
                    <span className="text-2xl">?</span>
                  )
                ) : ( */}
                <img
                  src={char.img}
                  alt={char.name}
                  className={`w-full h-full object-cover ${
                    selectedId === char.id ? "" : "grayscale"
                  }`}
                />
                {/* )} */}
                {/* ========================================================== */}
              </div>

              <p className="text-center text-xs uppercase tracking-wide">
                {char.name}
              </p>

              {selectedId === char.id && (
                <div className="absolute -top-2 -right-2 text-xs bg-black text-white px-1">
                  1P
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ================= CUSTOM CHARACTER FORM ================= */}
        {/* {selectedId === 4 && (
          <div className="bg-white border-4 border-[#535353] p-6 mb-8 w-full max-w-lg mx-auto shadow-[8px_8px_0px_0px_rgba(83,83,83,1)]">
            <h3 className="text-sm uppercase mb-4 text-[#535353] border-b-2 border-[#535353] pb-2">
              Customize Character
            </h3>
            <form onSubmit={handleCustomUpload} className="space-y-4">
              ...
            </form>
          </div>
        )} */}
        {/* =========================================================== */}

        <div className="w-full max-w-xs mx-auto">
          <Button
            onClick={startGame}
            variant="primary"
            className="w-full text-xl py-4 border-4"
          >
            START RUN
          </Button>
        </div>
      </div>
    </div>
  );
}
