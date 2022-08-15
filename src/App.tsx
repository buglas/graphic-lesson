import React from "react"
import { useRoutes } from "react-router-dom"
import "./App.css"
import Home from "./view/Home"
import LoopSubdivision from "./view/LoopSubdivision"

const App: React.FC = (): JSX.Element => {
	const routing = useRoutes([
		{
			path: "/",
			element: <Home />,
		},
		{
			path: "LoopSubdivision",
			element: <LoopSubdivision />,
		},
	])
	return <>{routing}</>
}

export default App
