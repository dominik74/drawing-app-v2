import styled from "styled-components";

const StyledTestComp = styled.div`
	
`;

interface Props {
	
}

export default function TestComp(props: Props) {
	return (
		<>
			<StyledTestComp>
				hey
			</StyledTestComp>
		</>
	);
}
