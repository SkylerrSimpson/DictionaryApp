// defintion object has at least three fields, definition, synonyms, and antoynsm
// defintion object may have an extra field named example
import { Color } from "../../../constant/Color";

const Definition = ({definitionObject}) => {
   return (
    <>
      <div style={{display: 'flex', flexDirection: 'row', alignItems:'center', marginBottom: 20, }}>
         <div style={{width: 5, height:5, backgroundColor: Color.accent, borderRadius: '50%', marginRight: 30,}}/>
         <div style={{fontSize: '1.2rem', lineHeight: '1.2rem'}}> {definitionObject.definition} </div>
      </div>
      {definitionObject.example && <div style={{fontSize:'1.2rem',
         lineHeight: '1.2rem',
         color:Color.secondaryText,
         marginBottom: 20,
         marginLeft: 26,
            }}>"{definitionObject.example}"</div>}

  </>
   );

};

export default Definition;