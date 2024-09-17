import { Color } from "../../constant/Color";
import { FaRegStar } from "react-icons/fa";
// task: display the word, its phonetics, and a star button

const Phonetics = ({ definition }) => {
    return (
        <div style={{display:"flex", justifyContent:'space-between', alignItems:'center'}}>
            <div>
                <div style={{fontSize: '4rem', fontWeight: 'bold', lineHeight: '4.5rem',}}>
                    {definition.word}
                </div>
                <div style={{fontStyle: 'italic', fontSize: '1.5rem', lineHeight: '2.25rem', color: Color.accent,}}>
                    {definition.phonetic}
                </div>
            </div>
            <button style={{background: 'none', border: 'none', cursor: 'pointer'}}>
                <FaRegStar size={30} color={Color.accent} />
            </button>
        </div>
    );
};

export default Phonetics;