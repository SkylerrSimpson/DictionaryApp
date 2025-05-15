import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { IoIosClose } from "react-icons/io";
import { Color } from "../constant/Color";

const navList = [
    { path: '/', name: 'Home'},
    { path: '/word-list', name: 'Word List' },
]

const SidebarHover = ( {setIsCollapsed}) => {
    return (
        <div>
            <Header>
                <h1>My dictionary</h1>
                <IoIosClose size={25} style={{cursor: 'pointer'}} onClick={() => setIsCollapsed(true)} />
            </Header>
            <Navigation>
                <ul>
                    {
                        navList.map((navItem) => (
                            <li key={navItem.path}> 
                            <NavLink to={navItem.path}>
                                {navItem.name}
                            </NavLink>
                            </li>
                        )
                    )
                    }
                </ul>
            </Navigation>
        </div>
    );
};

const Header = styled.div`
    padding: 1rem 2rem;
    border-bottom: 1px solid ${Color.borderColor};
    display: flex;
    justify-content: space-between;
    align-items: center;

    h1 {
        font-size: 1rem;
        display: flex;
        align-items: center;
        font-weight: 500;
        line-height: 1;
        padding: 1rem 0;
    }

    h1::before {
        content: url('logo.svg');
        margin-right: 0.5rem;
    }
`;

const Navigation = styled.nav`
    padding-top: 1rem;
    padding-left: 2rem;
    padding-right: 2rem;

    /* padding: 1rem 2rem 0 2rem;  */ 

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    li {
        margin: 1rem 0;
    }

    a {
        text-decoration: none;
        display: flex;
        padding: 0.5rem;
        border-radius: 8px;
        color: inherit;
    }

    a.active {
        background-color:  ${Color.accent};
        color: white;
    }
`;

export default SidebarHover;