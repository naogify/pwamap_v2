const Content = () => {

  return (
    <div
      className="loader"
      key={0}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      場所一覧を読み込み中です...
    </div>
  );
}

export default Content;
