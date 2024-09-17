import SearchBar from "./Searchbar";
import axios from "axios";
import { useState, useEffect } from "react";
import DefinitionArea from "./DefinitionArea";

const Home = () => {
    const [definition, setDefintion] = useState(null);

    const word = 'hello';

    const searchWordServer = async (word) => {
        try {
            const response = await axios.get(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
            );
            const data = response.data;
            console.log(data);
            return data[0];
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const renderInitialDefinition = async () => {
            const data = await searchWordServer(word);
            setDefintion(data);
        }

        renderInitialDefinition();
    }, []);

    return (
        <div>
            <SearchBar 
            setDefintion={setDefintion} 
            searchWordServer={searchWordServer}
            initialValue={word} 
            definition={definition}
            />
            <DefinitionArea definition={definition} />
        </div>
    );
};

export default Home;