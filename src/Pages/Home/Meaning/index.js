import PartOfSpeech from "./PartOfSpeech"
import { Color } from "../../../constant/Color"
import Definition from "./Definition"
import { IoPlayCircleOutline } from "react-icons/io5";
import Synonyms from "./Synonyms";

// task 1: render static word "Meaning" - design
// task 2: render all the definitions of a given meaning using bullet points- design
//         render the usage examples whenever availabel for every given defintion

const Meaning = ({ meaning, phonetics }) => {

    const playAudio = () => {

        const audio = new Audio(phonetics[0].audio); //create audio object

        audio.play();
    }

    return (
        <>
            <PartOfSpeech partOfSpeech={meaning.partOfSpeech} />
            <div style={{display: 'flex', justifyContent:'space-between'}}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                }}> 
                    <div style={{ fontSize: '1rem', lineHeight: '1.5rem', color: Color.secondaryText}}>
                        Meaning
                    </div>

                    <div style={{marginTop: '2rem', marginBottom: '2rem',}}>
                        {
                            meaning.definitions.map((definition, index) => (
                                <Definition key={index} definitionObject={definition} />
                            ))
                        }
                    </div>
                </div>
                <div style={{}}>
                        <IoPlayCircleOutline size={80} color={Color.accent} style={{cursor:'pointer'}} onClick={playAudio} />
                </div>
            </div>
            <Synonyms synonyms={meaning.synonyms} />

        </>
    );
};

export default Meaning;