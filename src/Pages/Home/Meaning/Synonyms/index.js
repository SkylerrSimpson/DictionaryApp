import Synonym from "./Synonym";
import { Color } from "../../../../constant/Color";

const Synonyms = ({ synonyms } ) => {

    if ( !synonyms ||synonyms.length === 0) {
        return null;
    }

    return (
    <div style={{display:'flex', flexDirection:'row', alignItems: 'center',
     justifyContent:'flex-start',  marginBottom: '1rem', flexFlow: 'wrap', marginTop: '2rem'}}>
        <div style={{fontSize:'1rem', lineHeight: '1.2rem', color:Color.secondaryText, marginRight: '2rem'}}>Synonyms</div>
        {
            synonyms.map((synonym, index) => (
                <Synonym key={index} index={index} length={synonyms.length} synonym={synonym} />
            ))
        }
    </div>

    )
};

export default Synonyms;