import "./style.scss";

const FiltersBlock = ({ children, extra, hasBackground, ...props }) => {
  return (
    <div
      className="FiltersBlock"
      style={{ background: hasBackground ? "#fff" : "" }}
      {...props}
    >
      <div className="side">{children}</div>
      <div className="side"> {extra}</div>
    </div>
  );
};

export default FiltersBlock;
