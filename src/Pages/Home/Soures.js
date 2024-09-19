import { Color } from "../../constant/Color"
import {TfiNewWindow} from "react-icons/tfi"; 

const Sources = ( {sourceUrls} ) => {

    if (!sourceUrls) return null;

    return (
        <div style={{display:'flex', flexDirection:'row', alignItems:'center',
        justifyContent: 'flex-start', marginBottom: '10rem', marginTop:'5rem'}}>
            <div style={{color:Color.secondaryText, fontSize: '1rem', lineHeight: '1rem', marginRight: '2rem'}}>Source</div>
            {
                sourceUrls.map((sourceUrl, index) => (
                    <a style={{ display: 'flex', color:Color.primaryText, fontSize: '1rem', gap: '0.5rem', alignItems:'center'}}
                    key={index} href={sourceUrl} target="_blank" rel="noreferrer">
                        {sourceUrl}
                        <TfiNewWindow/>
                    </a>
                ))
            }
        </div>

    );
};

export default Sources;