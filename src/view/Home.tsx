import React from "react"
import { Link } from "react-router-dom"

const Home: React.FC = (): JSX.Element => {
	return (
		<nav style={{ width: "60%", margin: "auto" }}>
			<h2>图形学</h2>
			<ul>
				<li>
					<Link to="/LoopSubdivision">LoopSubdivision 几何体细分</Link>
				</li>
			</ul>
		</nav>
	)
}

export default Home
