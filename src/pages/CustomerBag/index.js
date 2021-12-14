import React, { useEffect, useState } from 'react';
import { Container } from './styles';
import { Link } from 'react-router-dom';
import { MapPinIcon, ArrowIcon, BarcodeIcon, PixIcon, MasterCardIcon, TruckIcon, BagIcon } from 'assets/icons';
import { CustomerBagService } from 'services/CustomerBagService';
import useFallback from 'hooks/useFallback';
import Menu from 'shared/Menu';
import Footer from 'shared/Footer';
import NoProducts from 'components/NoProducts';

const CustomerBag = () => {

	const customerBagService = new CustomerBagService();
	
	const email = localStorage.getItem('email');

	const [customerBags, setCustomerBags] = useState([]);
	const [totalAmount, setTotalAmount] = useState(0);
	const [productsAmount, setProductsAmount] = useState(0);
	const [freight, setFreight] = useState(0);

	const [fallback, showFallback, hideFallback, loading] = useFallback();

	useEffect(() => {
		getCustomerBags();
	}, []);

	useEffect(() => {
		setTotalAmount(productsAmount + freight);
	}, [customerBags, productsAmount, freight]);

	const getCustomerBags = async () => {

		showFallback();
		const data = await customerBagService.listByEmail(email);

		setCustomerBags(data);
		
		setFreight(7.90);
		setTotalAmount(productsAmount + freight);
		setProductsAmount(data.reduce((accumulator, current) => {
			accumulator += parseFloat(current.product.price) * current.quantity;
			return accumulator;
		}, 0));

		hideFallback();
	};

	const changeQuantity = async (id, quantity) => {
		
		showFallback();

		if(quantity === 0) {
			await customerBagService.destroy(id);
			getCustomerBags();
			hideFallback();
			return;
		}

		await customerBagService.update(id, { quantity });
		getCustomerBags();

		hideFallback();
	};

	if(customerBags.length === 0 && !loading) return(
		<>
			<Menu/>
			<NoProducts/>
			<Footer/>
		</>
	);
	
	return (
		<Container>
			{ customerBags.length !== 0 && !loading && <>
				<div className="customer-bag-left">
					<div className="logo">
						<Link to='/'>
							<h1>KIMOCHISM <span>気持ち</span></h1>
						</Link>
					</div>
					<div className="customer-bag-container-infos">
						<div className="customer-endereco">
							<span>
								Entregar em
							</span>
							<span>
								<img className="pin" src={MapPinIcon} alt="Perfil" width="18px" />
								&nbsp;Rua Alfrejord Braumderson A23, Santo Grau - SP
							</span>
							<span>
								Usar outro endereço &nbsp;
								<img src={ArrowIcon} alt="Perfil" width="5px" />
							</span>
						</div>

						<div className="customer-frete">
							<span>
								<img src={TruckIcon} alt="Perfil" width="18px" />
								&nbsp;Frete [ Sedex ]
							</span>
							<span>R$ 8,90</span>
						</div>

						<div className="customer-payment-options">
							<span>Pagar com</span>
							<div className="option-payment">
								<img src={BarcodeIcon} />
								<span>Boleto</span>
							</div>
							<div className="option-payment">
								<img src={MasterCardIcon} />
								<span>Cartão de Crédito / Débito</span>
							</div>
							<div className="option-payment">
								<img src={PixIcon} />
								<span>Pix</span>
							</div>
						</div>
						<div className="come-back">
							<Link to="/catalog">
								<img src={ArrowIcon} alt="Perfil" width="5px" />
								<span>Continuar comprando</span>
							</Link>
						</div>
					</div>
				</div>
				<div className="customer-bag-right">

					<div className="header-products">
						<img src={BagIcon} />
						<span>Sua sacola</span>
					</div>

					{/* lista de produtos */}
					<div className="list-products">
						{customerBags && customerBags.map(customerBag => {
							return (
								<div className="product-item" key={customerBag._id}>
									<img src={customerBag.product.images[0].url} />
									<div className="product-info">
										<span>{customerBag.product.name}</span>
										<span>Tamanho: {customerBag.options.size}</span>
										<span>Cor: {customerBag.options.color.label}</span>
										<div className="quantity-products">
											<div>
												<span>Quantidade: {customerBag.quantity}</span>
											</div>
											<div className="quantity-buttons">
												<button onClick={() => changeQuantity(customerBag._id, customerBag.quantity - 1)}> - </button>
												<label> {customerBag.quantity} </label>
												<button onClick={() => changeQuantity(customerBag._id, customerBag.quantity + 1)}> + </button>
											</div>
										</div>
										<span>Preço Unidade: R$ {parseFloat(customerBag.product.price).toFixed(2)}</span>
									</div>
								</div>
							);
						})}
					</div>
					{/* lista de produtos */}

					<div className="checkout-products">
						<div>
							<span>Total:</span>
							<span>R$ {totalAmount.toFixed(2)}</span>
						</div>
						<div>
							<span>Produtos:</span>
							<span>R$ {productsAmount.toFixed(2)}</span>
						</div>
						<div>
							<span>Frete:</span>
							<span>R$ {freight.toFixed(2)}</span>
						</div>
						<button>Finalizar</button>
					</div>
				</div>
			</>
			}
			{fallback}
		</Container>
	);
};

export default CustomerBag;
