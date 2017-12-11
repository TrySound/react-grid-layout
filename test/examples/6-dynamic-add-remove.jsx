import React from 'react';
import { WidthProvider, Responsive } from 'react-grid-layout';
import _ from 'lodash';
import Draggable from 'react-draggable';


const ResponsiveReactGridLayout = WidthProvider(Responsive);
/**
 * This layout demonstrates how to use a grid with a dynamic number of elements.
 */
class AddRemoveLayout extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
    rowHeight: 100
  };

  constructor(props) {
    super(props);

    this.state = {
      items: [0, 1, 2, 3, 4].map(function(i, key, list) {
        return {i: i.toString(), x: i * 2, y: 0, w: 2, h: 2, add: i === (list.length - 1).toString()};
      }),
      newCounter: 0,
      placeholderPosition: { x: 0, y: 0 }
    };

    this.setRef = this.setRef.bind(this);
    this.setApi = this.setApi.bind(this);
    this.onAddItem = this.onAddItem.bind(this);
    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.onBreakpointChange = this.onBreakpointChange.bind(this);
    this.dragPlaceholder = this.dragPlaceholder.bind(this);
    this.stopPlaceholder = this.stopPlaceholder.bind(this);
    this.stopLayoutDrag = this.stopLayoutDrag.bind(this);
  }

  createElement(el) {
    const removeStyle = {
      position: 'absolute',
      right: '2px',
      top: 0,
      cursor: 'pointer'
    };
    const i = el.add ? '+' : el.i;
    return (
      <div key={i} data-grid={el}>
        {el.add ?
          <span className="add text" onClick={this.onAddItem} title="You can add an item by clicking here, too.">Add +</span>
        : <span className="text">{i}</span>}
        <span className="remove" style={removeStyle} onClick={this.onRemoveItem.bind(this, i)}>x</span>
      </div>
    );
  }

  onAddItem() {
    /*eslint no-console: 0*/
    console.log('adding', 'n' + this.state.newCounter);
    this.setState({
      // Add a new item. It must have a unique key!
      items: this.state.items.concat({
        i: 'n' + this.state.newCounter,
        x: this.state.items.length * 2 % (this.state.cols || 12),
        y: Infinity, // puts it at the bottom
        w: 2,
        h: 2
      }),
      // Increment the counter to ensure key is always unique.
      newCounter: this.state.newCounter + 1
    });
  }

  // We're using the cols coming back from this to calculate where to add new items.
  onBreakpointChange(breakpoint, cols) {
    this.setState({
      breakpoint: breakpoint,
      cols: cols
    });
  }

  onLayoutChange(layout) {
    console.log('layout changed', layout);
    this.props.onLayoutChange(layout);
    this.setState({layout: layout});
  }

  onRemoveItem(i) {
    console.log('removing', i);
    this.setState({items: _.reject(this.state.items, {i: i})});
  }

  dragPlaceholder(e, { node }) {
    const containerRect = this.container.getBoundingClientRect();
    const left = e.clientX - containerRect.left;
    const top = e.clientY - containerRect.top;
    if (left < 0 || top < 0) {
      this.api.externalDragOut({
        i: 'placeholder',
        w: 2,
        h: 2,
        e,
        node,
        newPosition: {
          left,
          top
        }
      });
    } else {
      this.api.externalDragIn({
        i: 'placeholder',
        w: 2,
        h: 2,
        e,
        node,
        newPosition: {
          left,
          top
        }
      });
    }
  }

  stopPlaceholder(e, { node }) {
    const containerRect = this.container.getBoundingClientRect();
    const left = e.clientX - containerRect.left;
    const top = e.clientY - containerRect.top;
    this.api.externalDragStop({
      i: 'placeholder',
      w: 2,
      h: 2,
      e,
      node,
      newPosition: {
        left,
        top
      }
    });
  }

  stopLayoutDrag(layout) {
    this.setState({
      items: layout
    });
  }

  setRef(node) {
    this.container = node;
  }

  setApi(api) {
    this.api = api;
  }

  render() {
    return (
      <div>
        <button onClick={this.onAddItem}>Add Item</button>
        <Draggable
          position={this.state.placeholderPosition}
          onDrag={this.dragPlaceholder}
          onStop={this.stopPlaceholder}>
          <button style={{ position: 'relative', zIndex: 1000 }}>Drag external Item</button>
        </Draggable>
        <div ref={this.setRef}>
          <ResponsiveReactGridLayout
            refApi={this.setApi}
            onDragStop={this.stopLayoutDrag}
            onLayoutChange={this.onLayoutChange}
            onBreakpointChange={this.onBreakpointChange}>
            {_.map(this.state.items, (el) => this.createElement(el))}
          </ResponsiveReactGridLayout>
        </div>
      </div>
    );
  }
}

module.exports = AddRemoveLayout;

if (require.main === module) {
  require('../test-hook.jsx')(module.exports);
}
