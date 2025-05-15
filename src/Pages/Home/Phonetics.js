import { Color } from "../../constant/Color";
import { FaRegStar, FaStar } from "react-icons/fa";
import useWordContext from "../../hook/useWordContext";
import { useState } from "react";
import useErrorContext from "../../hook/useErrorContext";
// task: display the word, its phonetics, and a star button

// task 1: implement and test addWord function
// task 2: implement and test deleteWord function

const Phonetics = ({ definition }) => {
    const [loading, setLoading] = useState(false);
    const { words, addWord, deleteWord } = useWordContext();
    const { reportErrors } = useErrorContext();

    // addWord function
    const handleAddWord = async () => {
        try {
            setLoading(true);
            await addWord(definition.word);
            setLoading(false);
        } catch (error) {
            reportErrors('home', error.message);
        }
    };

    // deleteWord
    const handleDeleteWord = async () => {
        try {
            setLoading(true);            
            await deleteWord(definition.word);
            setLoading(false);
        } catch (error) {
            reportErrors('home', error.message);
        }
    }

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


            {
                words.some((element) => element.word === definition.word) ? 
                <button style={{background: 'none', border: 'none', cursor: 'pointer'}} onClick={handleDeleteWord} disabled={loading}>
                <FaStar size={30} color={Color.accent} />
                </button>: 
                <button style={{background: 'none', border: 'none', cursor: 'pointer'}} onClick={handleAddWord} disabled={loading}>
                <FaRegStar size={30} color={Color.accent} />
                </button>}
        </div>
    );
};

export default Phonetics;