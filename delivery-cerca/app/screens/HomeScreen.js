import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Location, Permissions } from 'expo';
import { Button } from 'react-native-elements';
import get from 'lodash/get';
import pick from 'lodash/pick';

import YelpService from '../services/yelp';
import Map from '../components/Map';

class HomeScreen extends Component {
	filterButtons = [
		{ label: 'Open now', color: '#01BAEF', filter: { openNow: true } },
		{ label: 'Delivery', color: '#A40606', filter: { term: 'delivery' } },
		{
			label: 'Pizza Delivery',
			color: '#FFA69E',
			filter: { term: 'pizza delivery' }
		},
		{
			label: 'Walking Distance',
			color: '#861657',
			filter: { radius: 3000 }
		},
		{
			label: 'Water Delivery',
			color: '#5F0A87',
			filter: { attributes: 'water' }
		}
	];

	state = {
		location: null,
		errorMessage: null,
		deliveryShops: []
	};

	componentWillMount() {
		this.getLocationAsync();
	}

	getDeliveryShops = async filter => {
		const coords = get(this.state.location, 'coords');
		const userLocation = pick(coords, ['latitude', 'longitude']);
		let deliveryShops = await YelpService.getDeliveryShops(
			userLocation,
			filter
		);
		this.setState({ deliveryShops });
	};

	getLocationAsync = async () => {
		let { status } = await Permissions.askAsync(Permissions.LOCATION);
		if (status !== 'granted') {
			this.setState({
				errorMessage: 'Permission to access location was denied'
			});
		}

		let location = await Location.getCurrentPositionAsync({});
		await this.setState({ location });
		this.getDeliveryShops();
	};

	handleFilterPress = filter => {
		this.getDeliveryShops(filter);
	};

	renderFilterButtons() {
		return this.filterButtons.map((button, i) => (
			<Button
				key={i}
				title={button.label}
				buttonStyle={{
					backgroundColor: button.color,
					...styles.button
				}}
				onPress={() => this.handleFilterPress(button.filter)}
			/>
		));
	}

	render() {
		const { location, deliveryShops } = this.state;

		return (
			<View style={{ flex: 7 }}>
				<Map location={location} places={deliveryShops} />
				<View style={styles.filters}>{this.renderFilterButtons()}</View>
			</View>
		);
	}
}

const styles = {
	filters: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		flexWrap: 'wrap'
	},
	button: {
		marginVertical: 4
	}
};

export { HomeScreen };
