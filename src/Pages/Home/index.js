import SearchBar from "./Searchbar";
import axios from "axios";
import { useSearchParams  } from "react-router-dom";
import { useState, useEffect  } from "react";
import DefinitionArea from "./DefinitionArea";
import useWordContext from "../../hook/useWordContext";
import ErrorDisplay from "../../component/ErrorDisplay";

const Home = () => {
    const [definition, setDefintion] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const { words, addWord } = useWordContext();

    console.log(words);
    console.log(addWord);

    const word = searchParams.get('word')  ||'hello';

    const searchWordServer = async (word) => {
        try {
            const response = await axios.get(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
            );
            const data = response.data;
            console.log(data);
            return data[0];
        } catch (error) {
            console.error(error);
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
            <ErrorDisplay pageKey='home' />
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