function IconeProduto({ produto, className }) {
  if (produto?.image_url) {
    return (
      <img
        className={`${className} icone-marca-imagem`}
        src={produto.image_url}
        alt={produto.name || 'Produto'}
      />
    )
  }

  return <span className={className}>{produto?.image}</span>
}

export default IconeProduto
